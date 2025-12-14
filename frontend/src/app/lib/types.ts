export interface Stock {
  no: number;
  particulars: string;
  symbol: string;
  purchasePrice: number;
  qty: number;
  investment: number;
  portfolioPercent: number;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  marketCap: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  revenueTTM: number;
  ebitdaTTM: number;
  ebitdaPercent: number | string;
  pat: number;
  patPercent: number | string;
  cfoMarch24: number;
  cfo5Years: number;
  freeCashFlow: number;
  debtToEquity: number;
  bookValue: number;
  revenueGrowth: number | string;
  ebitdaGrowth: number | string;
  profitGrowth: number | string;
  marketCap2: number;
  priceToSales: number;
  cfoToEbitda: number | string;
  cfoToPat: number | string;
  priceToBook: number;
  stage2: string;
  salePrice: number;
  abhishek: string;
}

export interface Sector {
  sectorName: string;
  investment: number;
  portfolioPercent: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  holdings: Stock[];
}

export interface GrandTotal {
  investment: number;
  portfolioPercent: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface HoldingsData {
  grandTotal: GrandTotal;
  sectors: Sector[];
}

export interface PortfolioState extends GrandTotal {
  sectors: Sector[];
  lastUpdated: string;
  loading: boolean;
  error: string | null;
}

export interface APIResponse {
  cmp: number;
  peRatio: number;
  latestEarnings: number;
  timestamp: string;
}
