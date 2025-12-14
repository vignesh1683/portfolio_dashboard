import { HoldingsData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface APIResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: {
    code: string;
    message: string;
    timestamp: string;
  };
}

export async function fetchHoldings(): Promise<HoldingsData> {
  try {
    const response = await fetch(`${API_BASE_URL}/holdings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch holdings: ${response.statusText}`);
    }

    const result: APIResponse<HoldingsData> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch holdings');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching holdings data:', error);
    throw error;
  }
}

export async function fetchStockData(symbol: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stock data for ${symbol}: ${response.statusText}`);
    }

    const result: APIResponse<any> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || `Failed to fetch stock data for ${symbol}`);
    }

    return result.data;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    throw error;
  }
}

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
}
