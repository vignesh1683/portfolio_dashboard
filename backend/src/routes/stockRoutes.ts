import { Router, Request, Response } from "express";
import stockService from "../services/stockService";

const router = Router();

router.get("/cache/stats", (_req: Request, res: Response) => {
  const stats = stockService.getCacheStats();
  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  });
});

router.delete("/cache", (_req: Request, res: Response) => {
  stockService.clearStockCache();
  stockService.clearHoldingsCache();
  res.json({
    success: true,
    message: "All caches cleared",
    timestamp: new Date().toISOString(),
  });
});

router.delete("/cache/stocks/:symbol", (req: Request, res: Response) => {
  const { symbol } = req.params;
  stockService.clearStockCache(symbol.toUpperCase());
  res.json({
    success: true,
    message: `Cache cleared for ${symbol.toUpperCase()}`,
    timestamp: new Date().toISOString(),
  });
});

router.get("/holdings", async (_req: Request, res: Response) => {
  try {
    const holdings = await stockService.getHoldingsData();
    return res.status(200).json({
      success: true,
      data: holdings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

router.get("/stocks/:symbol", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const stockData = await stockService.getStockData(symbol.toUpperCase());

    res.json({
      success: true,
      data: stockData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "STOCK_FETCH_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to fetch stock data",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

router.get("/stocks", async (req: Request, res: Response) => {
  try {
    const { symbols } = req.query;

    if (!symbols || typeof symbols !== "string") {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAMS",
          message: "symbols query parameter is required (comma-separated)",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const symbolArray = symbols.split(",").map((s) => s.trim().toUpperCase());
    const stocksData = await stockService.getMultipleStocks(symbolArray);

    res.json({
      success: true,
      data: stocksData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "STOCKS_FETCH_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to fetch stocks",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
