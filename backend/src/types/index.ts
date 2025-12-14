export interface StockData {
  symbol: string;
  cmp: number;
  peRatio: number;
  latestEarnings: number;
  timestamp: string;
  source: 'yahoo-finance' | 'yahoo' | 'google' | 'cache' | 'error';
}

export interface APIError {
  code: string;
  message: string;
  timestamp: string;
}

export interface CacheEntry {
  data: StockData;
  timestamp: number;
  ttl: number; 
}

export interface APIResponse {
  success: boolean;
  data?: StockData | StockData[];
  error?: APIError;
  timestamp: string;
}
