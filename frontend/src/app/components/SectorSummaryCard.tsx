'use client';

import React, { memo } from 'react';
import {
  Card,
  Box,
  Typography,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { Sector } from '@/app/lib/types';

interface SectorSummaryCardProps {
  sector: Sector;
  onDoubleClick?: (sectorName: string) => void;
}

const getSectorColor = (name: string) => {
  const colors = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#14b8a6',
    '#06b6d4',
    '#3b82f6',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const SectorSummaryCard: React.FC<SectorSummaryCardProps> = memo(({ sector, onDoubleClick }) => {
  const theme = useTheme();
  const isPositive = sector.gainLoss >= 0;
  const sectorColor = getSectorColor(sector.sectorName);

  return (
    <Card
      onDoubleClick={() => onDoubleClick?.(sector.sectorName)}
      sx={{
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        boxShadow: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'}`,
        },
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: sectorColor + '18',
              color: sectorColor,
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
          >
            {sector.sectorName.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {sector.sectorName}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {sector.holdings.length} holding{sector.holdings.length > 1 ? 's' : ''}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 2,
              backgroundColor: isPositive
                ? theme.palette.success.main + '15'
                : theme.palette.error.main + '15',
            }}
          >
            {isPositive ? (
              <ArrowUpward sx={{ fontSize: 14, color: theme.palette.success.main }} />
            ) : (
              <ArrowDownward sx={{ fontSize: 14, color: theme.palette.error.main }} />
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: isPositive ? theme.palette.success.main : theme.palette.error.main,
              }}
            >
              {Math.abs(sector.gainLossPercent).toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            ₹{sector.presentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Current Value
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: 2,
            borderTop: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              ₹{sector.investment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem' }}>
              INVESTED
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: isPositive ? theme.palette.success.main : theme.palette.error.main,
              }}
            >
              {isPositive ? '+' : ''}₹{sector.gainLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.65rem' }}>
              {isPositive ? 'PROFIT' : 'LOSS'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
});

SectorSummaryCard.displayName = 'SectorSummaryCard';

export default SectorSummaryCard;
