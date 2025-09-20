import { useEffect } from 'react';

const themes = {
  lavender: {
    primary: '250 55% 65%',
    'primary-soft': '250 40% 85%',
    secondary: '270 45% 75%',
    'secondary-soft': '270 30% 90%',
  },
  mint: {
    primary: '160 40% 75%',
    'primary-soft': '160 30% 85%',
    secondary: '180 35% 80%',
    'secondary-soft': '180 25% 90%',
  },
  peach: {
    primary: '25 80% 75%',
    'primary-soft': '25 60% 85%',
    secondary: '45 70% 80%',
    'secondary-soft': '45 50% 90%',
  },
  ocean: {
    primary: '200 60% 70%',
    'primary-soft': '200 45% 85%',
    secondary: '220 50% 75%',
    'secondary-soft': '220 35% 90%',
  },
};

const fontSizes = {
  small: {
    'text-base': '14px',
    'text-sm': '12px',
    'text-lg': '16px',
    'text-xl': '18px',
  },
  medium: {
    'text-base': '16px',
    'text-sm': '14px',
    'text-lg': '18px',
    'text-xl': '20px',
  },
  large: {
    'text-base': '18px',
    'text-sm': '16px',
    'text-lg': '20px',
    'text-xl': '24px',
  },
  'extra-large': {
    'text-base': '20px',
    'text-sm': '18px',
    'text-lg': '24px',
    'text-xl': '28px',
  },
};

export function useTheme() {
  const applyTheme = (themeName: string) => {
    const theme = themes[themeName as keyof typeof themes];
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply theme colors
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Update gradients based on new colors
    root.style.setProperty(
      '--gradient-primary', 
      `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.secondary}))`
    );
  };

  const applyFontSize = (fontSize: string) => {
    const sizes = fontSizes[fontSize as keyof typeof fontSizes];
    if (!sizes) return;

    const root = document.documentElement;
    
    // Apply font sizes
    Object.entries(sizes).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };

  return {
    applyTheme,
    applyFontSize,
  };
}