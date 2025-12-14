'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { mode: 'system' as ThemeMode, setMode: () => { }, isDark: false };
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedMode = (localStorage.getItem('theme-mode') as ThemeMode) || 'system';
    setMode(savedMode);

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark =
      savedMode === 'dark' || (savedMode === 'system' && prefersDark);
    setIsDark(shouldBeDark);
    setMounted(true);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (mode === 'light') {
      setIsDark(false);
    } else if (mode === 'dark') {
      setIsDark(true);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }

    localStorage.setItem('theme-mode', mode);
  }, [mode, mounted]);

  const muiTheme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: isDark ? '#60a5fa' : '#2563eb',
        light: isDark ? '#93c5fd' : '#3b82f6',
        dark: isDark ? '#1e40af' : '#1d4ed8',
      },
      secondary: {
        main: isDark ? '#f59e0b' : '#f97316',
        light: isDark ? '#fbbf24' : '#fb923c',
        dark: isDark ? '#d97706' : '#ea580c',
      },
      background: {
        default: isDark ? '#0f172a' : '#f8fafc',
        paper: isDark ? '#1e293b' : '#ffffff',
      },
      error: {
        main: isDark ? '#f87171' : '#ef4444',
      },
      success: {
        main: isDark ? '#4ade80' : '#22c55e',
      },
      warning: {
        main: isDark ? '#facc15' : '#eab308',
      },
      info: {
        main: isDark ? '#38bdf8' : '#0ea5e9',
      },
      divider: isDark ? '#334155' : '#e2e8f0',
    },
    typography: {
      fontFamily: '"Geist", "Geist Mono", system-ui, -apple-system, sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            padding: '10px 24px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDark
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            boxShadow: isDark
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            boxShadow: isDark
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            backdropFilter: 'blur(10px)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDark }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
