'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardHeader,
  CardContent,
  useTheme,
  Paper,
} from '@mui/material';
import {
  Refresh,
  PlayArrow,
  Pause,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { PortfolioState } from '@/app/lib/types';
import { fetchHoldings, fetchStockData } from '@/app/lib/api';
import PortfolioTable from './PortfolioTable';
import SectorSummaryCard from './SectorSummaryCard';
import PortfolioOverview from './PortfolioOverview';
import SectorChart from './SectorChart';
import { ThemeToggle } from './ThemeToggle';
import { useThemeMode } from '@/app/providers';

const REFRESH_INTERVAL = parseInt(
  process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '15000'
);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { isDark } = useThemeMode();
  const sectorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToSector = useCallback((sectorName: string) => {
    const ref = sectorRefs.current[sectorName];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const [portfolioState, setPortfolioState] = useState<PortfolioState>({
    investment: 0,
    portfolioPercent: 100,
    presentValue: 0,
    gainLoss: 0,
    gainLossPercent: 0,
    sectors: [],
    lastUpdated: '',
    loading: true,
    error: null,
  });

  const [autoUpdate, setAutoUpdate] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveData = useCallback(async () => {
    try {
      setIsRefreshing(true);

      const holdingsData = await fetchHoldings();
      const updatedSectors = await Promise.all(
        holdingsData.sectors.map(async (sector) => {
          const updatedHoldings = await Promise.all(
            sector.holdings.map(async (stock) => {
              const liveData = await fetchStockData(stock.symbol);

              const cmp = liveData.cmp ?? 0;
              const presentValue = cmp * stock.qty;
              const gainLoss = presentValue - stock.investment;
              const gainLossPercent = stock.investment
                ? (gainLoss / stock.investment) * 100
                : 0;

              return {
                ...stock,
                cmp,
                presentValue,
                gainLoss,
                gainLossPercent,
                peRatio: liveData.peRatio ?? stock.peRatio,
              };
            })
          );

          const sectorInvestment = updatedHoldings.reduce(
            (sum, s) => sum + s.investment,
            0
          );
          const sectorPresentValue = updatedHoldings.reduce(
            (sum, s) => sum + s.presentValue,
            0
          );

          return {
            ...sector,
            holdings: updatedHoldings,
            investment: sectorInvestment,
            presentValue: sectorPresentValue,
            gainLoss: sectorPresentValue - sectorInvestment,
            gainLossPercent: sectorInvestment
              ? ((sectorPresentValue - sectorInvestment) / sectorInvestment) * 100
              : 0,
          };
        })
      );

      const totalInvestment = holdingsData.grandTotal.investment;

      const totalPresentValue = updatedSectors.reduce(
        (sum, s) => sum + s.presentValue,
        0
      );

      const totalGainLoss = totalPresentValue - totalInvestment;

      setPortfolioState({
        investment: totalInvestment,
        portfolioPercent: 100,
        presentValue: totalPresentValue,
        gainLoss: totalGainLoss,
        gainLossPercent: totalInvestment
          ? (totalGainLoss / totalInvestment) * 100
          : 0,
        sectors: updatedSectors,
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching holdings data:", error);
      setPortfolioState((prev) => ({
        ...prev,
        error: "Failed to fetch holdings data. Please try again.",
        loading: false,
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, []);


  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      fetchLiveData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoUpdate, fetchLiveData]);

  if (portfolioState.loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: isDark
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress
            size={60}
            sx={{
              color: theme.palette.primary.main,
              mb: 2,
            }}
          />
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            Loading Portfolio...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: isDark
            ? 'rgba(15, 23, 42, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar
          sx={{
            maxWidth: '1400px',
            width: '100%',
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
            >
              <DashboardIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Portfolio Dashboard
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  display: 'block',
                }}
              >
                Last updated:{' '}
                {new Date(portfolioState.lastUpdated).toLocaleTimeString('en-IN')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => fetchLiveData()}
              disabled={isRefreshing}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>

            <Button
              variant={autoUpdate ? 'contained' : 'outlined'}
              startIcon={autoUpdate ? <PlayArrow /> : <Pause />}
              onClick={() => setAutoUpdate(!autoUpdate)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {autoUpdate ? 'Live' : 'Paused'}
            </Button>

            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {portfolioState.error && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            onClose={() =>
              setPortfolioState((prev) => ({ ...prev, error: null }))
            }
          >
            {portfolioState.error}
          </Alert>
        )}

        <PortfolioOverview {...portfolioState} />

        <Box sx={{ mt: 4 }}>
          <SectorChart sectors={portfolioState.sectors} isDark={isDark} onSectorDoubleClick={scrollToSector} />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            Sector Performance
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {portfolioState.sectors.map((sector) => (
              <SectorSummaryCard key={sector.sectorName} sector={sector} onDoubleClick={scrollToSector} />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            Holdings by Sector
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 3,
            }}
          >
            {portfolioState.sectors.map((sector) => {
              const isProfit = sector.gainLoss >= 0;
              return (
                <Card
                  key={sector.sectorName}
                  ref={(el) => { sectorRefs.current[sector.sectorName] = el; }}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {sector.sectorName} Sector Holdings
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Invested: <strong>₹{sector.investment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: isProfit ? theme.palette.success.main : theme.palette.error.main }}>
                            {isProfit ? 'Profit' : 'Loss'}: <strong>₹{Math.abs(sector.gainLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({sector.gainLossPercent >= 0 ? '+' : ''}{sector.gainLossPercent.toFixed(2)}%)</strong>
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(15, 23, 42, 0.8)'
                        : 'rgba(248, 250, 252, 0.8)',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <CardContent sx={{ p: 0, overflowX: 'auto' }}>
                    <PortfolioTable
                      stocks={sector.holdings}
                      sector={sector.sectorName}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
