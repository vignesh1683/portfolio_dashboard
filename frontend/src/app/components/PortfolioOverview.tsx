'use client';

import React, { memo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShowChart,
  AttachMoney,
} from '@mui/icons-material';
import { PortfolioState } from '@/app/lib/types';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard = memo(({ label, value, icon, color, bgColor }: StatCardProps) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'none',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                mb: 1,
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: color,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: bgColor,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

const PortfolioOverview: React.FC<PortfolioState> = memo((props) => {
  const { investment, presentValue, gainLoss, gainLossPercent } = props;
  const theme = useTheme();
  const isPositive = gainLoss >= 0;
  const textColor = theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b';
  const gridColor = theme.palette.divider;

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        <StatCard
          label="Total Investment"
          value={`₹${investment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={<AccountBalance sx={{ fontSize: 24 }} />}
          color={theme.palette.primary.main}
          bgColor={theme.palette.primary.main + '20'}
        />
        <StatCard
          label="Current Value"
          value={`₹${presentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={<ShowChart sx={{ fontSize: 24 }} />}
          color={theme.palette.info.main}
          bgColor={theme.palette.info.main + '20'}
        />
        <StatCard
          label={isPositive ? 'Total Gain' : 'Total Loss'}
          value={`₹${Math.abs(gainLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={isPositive ? <TrendingUp sx={{ fontSize: 24 }} /> : <TrendingDown sx={{ fontSize: 24 }} />}
          color={isPositive ? theme.palette.success.main : theme.palette.error.main}
          bgColor={isPositive ? theme.palette.success.main + '20' : theme.palette.error.main + '20'}
        />
        <StatCard
          label="Overall Return"
          value={`${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%`}
          icon={<AttachMoney sx={{ fontSize: 24 }} />}
          color={isPositive ? theme.palette.success.main : theme.palette.error.main}
          bgColor={isPositive ? theme.palette.success.main + '20' : theme.palette.error.main + '20'}
        />
      </Box>
    </Box>
  );
});

PortfolioOverview.displayName = 'PortfolioOverview';

export default PortfolioOverview;
