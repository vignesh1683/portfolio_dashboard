"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  useTheme,
  Box,
  Typography,
} from "@mui/material";
import { Sector } from "@/app/lib/types";

interface SectorChartProps {
  sectors: Sector[];
  isDark: boolean;
  onSectorDoubleClick?: (sectorName: string) => void;
}

interface SectorChartData {
  name: string;
  value: number;
  investment: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  [key: string]: string | number;
}

const COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];

const SectorChart: React.FC<SectorChartProps> = ({ sectors, isDark, onSectorDoubleClick }) => {
  const theme = useTheme();

  const chartData: SectorChartData[] = useMemo(() => {
    return sectors.map((sector) => ({
      name: sector.sectorName,
      value: sector.presentValue,
      investment: sector.investment,
      presentValue: sector.presentValue,
      gainLoss: sector.gainLoss,
      gainLossPercent: sector.gainLossPercent,
    }));
  }, [sectors]);

  const textColor = isDark ? "#e2e8f0" : "#1e293b";
  const gridColor = isDark ? "#334155" : "#e2e8f0";

  const CustomTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isGain = data.gainLoss >= 0;
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {data.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.primary.main }}
          >
            Value: ₹
            {data.presentValue.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </Typography>
          <br />
          <Typography
            variant="caption"
            sx={{
              color: isGain
                ? theme.palette.success.main
                : theme.palette.error.main,
            }}
          >
            {isGain ? "Gain" : "Loss"}: ₹
            {Math.abs(data.gainLoss).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}{" "}
            ({data.gainLossPercent.toFixed(2)}%)
          </Typography>
        </Box>
      );
    }
    sectors;
    return null;
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
      }}
    >
      <Card
        sx={{
          borderRadius: 2,
          backgroundColor: "transparent",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        }}
      >
        <CardHeader
          title="Sector Allocation"
          titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
          sx={{ pb: 2 }}
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSectorDoubleClick?.(entry.name)}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px", color: textColor }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card
        sx={{
          borderRadius: 2,
          backgroundColor: "transparent",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        }}
      >
        <CardHeader
          title="Sector Performance"
          titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
          sx={{ pb: 2 }}
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke={textColor}
                style={{ fontSize: "12px" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke={textColor} style={{ fontSize: "12px" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="gainLossPercent"
                fill={theme.palette.primary.main}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SectorChart;
