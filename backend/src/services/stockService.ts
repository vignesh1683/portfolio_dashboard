import yahooFinance from "yahoo-finance2";
import { StockData } from "../types";
import axios from 'axios';
import * as cheerio from 'cheerio';

const SYMBOL_MAP: Record<string, string> = {
  "532174": "ICICIBANK.NS",   
  "533282": "GRAVITA.NS",     
  "540719": "SBILIFE.NS",     
  "500209": "INFY.NS",        
  "543237": "HAPPSTMNDS.NS",  
  "543272": "EASEMYTRIP.NS",  
  "511577": "511577.BO",      
  "541557": "541557.BO"       
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class StockService {
  private stockCache: Map<string, CacheEntry<StockData>> = new Map();
  private holdingsCache: CacheEntry<any[]> | null = null;
  private readonly STOCK_CACHE_DURATION = 60 * 1000;

  private isCacheValid<T>(cache: CacheEntry<T> | undefined | null, duration: number): boolean {
    if (!cache) return false;
    return Date.now() - cache.timestamp < duration;
  }

  async getStockData(symbol: string): Promise<StockData> {
    const cached = this.stockCache.get(symbol);
    if (this.isCacheValid(cached, this.STOCK_CACHE_DURATION)) {
      console.log(`Cache HIT for ${symbol}`);
      return cached!.data;
    }
    try {
      const yahooData = await this.fetchFromYahooFinance(symbol);
      this.stockCache.set(symbol, {
        data: yahooData,
        timestamp: Date.now(),
      });
      return yahooData;
    } catch (error) {
      if (cached) {
        console.log(`Fetch failed for ${symbol}, returning stale cache`);
        return cached.data;
      }
      throw new Error(`Failed to fetch stock data for ${symbol}`);
    }
  };

  async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    const promises = symbols.map((symbol) => this.getStockData(symbol));
    return Promise.all(promises);
  }

  clearStockCache(symbol?: string): void {
    if (symbol) {
      this.stockCache.delete(symbol);
      console.log(`Cache cleared for ${symbol}`);
    } else {
      this.stockCache.clear();
      console.log('All stock cache cleared');
    }
  }

  clearHoldingsCache(): void {
    this.holdingsCache = null;
    console.log('Holdings cache cleared');
  }

  getCacheStats(): { stockCacheSize: number; holdingsCached: boolean } {
    return {
      stockCacheSize: this.stockCache.size,
      holdingsCached: this.holdingsCache !== null,
    };
  }

  private async fetchFromYahooFinance(symbol: string): Promise<StockData> {
      try {
        let yahooSymbol = symbol;
        if (SYMBOL_MAP[symbol]) {
          yahooSymbol = SYMBOL_MAP[symbol];
        } 
        else if (!isNaN(Number(symbol))) {
          yahooSymbol = `${symbol}.BO`;
        } else if (!symbol.includes(".")) {
          yahooSymbol = `${symbol}.NS`;
        }

        const quote = await yahooFinance.quote(yahooSymbol, {
          fields: ["regularMarketPrice"],
        });
        const googleData = await this.fetchFromGoogleFinance(symbol, yahooSymbol);
        return {
          symbol,
          cmp: quote.regularMarketPrice ?? 0,
          peRatio: googleData.peRatio, 
          latestEarnings: 0, 
          source: "yahoo",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Yahoo Failed for ${symbol}`, error);
        return { symbol, cmp: 0, peRatio: 0, latestEarnings: 0, source: "cache" , timestamp: new Date().toISOString() };
      }
  }

  private async fetchFromGoogleFinance(symbol: string, yahooSymbol: string) {
    try {
      let googleSymbol = yahooSymbol.replace(".NS", ":NSE").replace(".BO", ":BOM");
      if (!googleSymbol.includes(":")) {
        googleSymbol = isNaN(Number(yahooSymbol)) ? `${yahooSymbol}:NSE` : `${yahooSymbol}:BOM`;
      }
      const url = `https://www.google.com/finance/quote/${googleSymbol}`;
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const getValue = (label: string) => {
        const labelDiv = $(`div:contains("${label}")`).filter((_, el) => $(el).text().trim() === label).last();
        const row = labelDiv.closest('.gyFHrc');
        let val = row.find('.P6K39c').text().trim();
        if (!val) {
          val = labelDiv.parent().children().last().text().trim();
        }
        return val;
      };
      const peText = getValue("P/E ratio");
      const epsText = getValue("EPS (TTM)");
      console.log(`Google Data for ${symbol}: P/E=${peText}, EPS=${epsText}`);
      return {
        peRatio: parseFloat(peText.replace(/,/g, '')) || 0,
        latestEarnings: parseFloat(epsText.replace(/,/g, '')) || 0
      };
    } catch (error) {
      console.error(`Google Finance scrape error for ${symbol}`, error);
      return { peRatio: 0, latestEarnings: 0 };
    }
  }

  async getHoldingsData(): Promise<any[]> {
    try {
      const holdingsData = require("../data/holdings.json");
      return holdingsData;
    } catch (error) {
      console.error("Error loading holdings data:", error);
      throw new Error("Failed to load holdings data");
    }
  }
}

export default new StockService();
