'use client';

import React from 'react';
import { useThemeMode } from '@/app/providers';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  SettingsBrightness,
} from '@mui/icons-material';

export const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const { mode, setMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectMode = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
    handleClose();
  };

  const getIcon = () => {
    if (mode === 'dark') return <Brightness4 />;
    if (mode === 'light') return <Brightness7 />;
    return <SettingsBrightness />;
  };

  return (
    <>
      <Tooltip title="Theme settings">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          {getIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => handleSelectMode('light')}
          selected={mode === 'light'}
          sx={{ display: 'flex', gap: 1 }}
        >
          <Brightness7 fontSize="small" />
          Light
        </MenuItem>
        <MenuItem
          onClick={() => handleSelectMode('dark')}
          selected={mode === 'dark'}
          sx={{ display: 'flex', gap: 1 }}
        >
          <Brightness4 fontSize="small" />
          Dark
        </MenuItem>
        <MenuItem
          onClick={() => handleSelectMode('system')}
          selected={mode === 'system'}
          sx={{ display: 'flex', gap: 1 }}
        >
          <SettingsBrightness fontSize="small" />
          System
        </MenuItem>
      </Menu>
    </>
  );
};
