"use client";

import React, { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  Typography,
  useTheme,
} from "@mui/material";
import { TrendingUp, TrendingDown, ShowChart } from "@mui/icons-material";
import { Stock } from "@/app/lib/types";

interface PortfolioTableProps {
  stocks: Stock[];
  sector: string;
}

const GainLossCell = memo(
  ({ value, percentage }: { value: number; percentage: number }) => {
    const theme = useTheme();
    const isPositive = value >= 0;

    return (
      <TableCell align="right">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 0.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {isPositive ? (
              <TrendingUp
                sx={{ fontSize: 16, color: theme.palette.success.main }}
              />
            ) : (
              <TrendingDown
                sx={{ fontSize: 16, color: theme.palette.error.main }}
              />
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: isPositive
                  ? theme.palette.success.main
                  : theme.palette.error.main,
              }}
            >
              ₹
              {Math.abs(value).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Box>
          <Chip
            label={`${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`}
            size="small"
            color={isPositive ? "success" : "error"}
            variant="outlined"
            sx={{ height: 20 }}
          />
        </Box>
      </TableCell>
    );
  }
);

GainLossCell.displayName = "GainLossCell";

const PortfolioTable: React.FC<PortfolioTableProps> = memo(
  ({ stocks, sector }) => {
    const theme = useTheme();
    const rowHeight = 72;
    const headerHeight = 56;
    const maxHeight = 500;
    const calculatedHeight = headerHeight + (stocks.length * rowHeight) + 2;
    const tableHeight = Math.min(calculatedHeight, maxHeight);

    return (
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          maxHeight: tableHeight,
          overflow: "auto",
        }}
      >
        <Table
          sx={{
            minWidth: 900,
            "& .MuiTableHead-root": {
              backgroundColor:
                theme.palette.mode === "dark" ? "#0f172a" : "#f1f5f9",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Stock</TableCell>
              <TableCell align="right">Buy Price</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Investment</TableCell>
              <TableCell align="right">Portfolio %</TableCell>
              <TableCell align="right">CMP</TableCell>
              <TableCell align="right">Current Value</TableCell>
              <TableCell align="right">Gain/Loss</TableCell>
              <TableCell align="right">P/E Ratio</TableCell>
              <TableCell align="right">Latest EPS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((stock, index) => (
              <TableRow key={`${stock.symbol}-${index}`}>
                <TableCell>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {stock.particulars}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    >
                      {stock.symbol}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ₹
                    {stock.purchasePrice.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip label={stock.qty} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ₹
                    {stock.investment.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${stock.portfolioPercent.toFixed(2)}%`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 0.5,
                    }}
                  >
                    <ShowChart
                      sx={{ fontSize: 16, color: theme.palette.primary.main }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                      }}
                    >
                      ₹
                      {stock.cmp.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ₹
                    {stock.presentValue.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </Typography>
                </TableCell>
                <GainLossCell
                  value={stock.gainLoss}
                  percentage={stock.gainLossPercent}
                />
                <TableCell align="right">
                  <Typography variant="body2">
                    {stock.peRatio !== null && stock.peRatio > 0
                      ? stock.peRatio.toFixed(2)
                      : "-"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {stock.latestEarnings !== null && stock.latestEarnings > 0
                      ? stock.latestEarnings.toFixed(2)
                      : "-"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
);

PortfolioTable.displayName = "PortfolioTable";

export default PortfolioTable;
