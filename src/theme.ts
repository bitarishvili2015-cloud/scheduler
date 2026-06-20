/**
 * central design tokens and theme configurations
 * "ფერები/დაშორებები/ფონტები ერთ ცენტრალურ ფაილში"
 */

export const THEME_TOKENS = {
  // Brand & Utility Colors
  colors: {
    brand: {
      primary: '#185FA5',
      primaryHover: '#124982',
      primaryLight: '#E0F2FE', // for SQL Server pill and highlights
      primaryDark: '#0369A1',
    },
    success: {
      light: '#F0FDFA', // for MySQL pill / success light alert
      text: '#0F766E',
      dot: '#10B981', // emerald-500
    },
    error: {
      light: '#FEF2F2',
      text: '#DC2626',
      dot: '#EF4444', // red-500
    },
    warning: {
      light: '#FFFBEB',
      text: '#D97706',
      dot: '#F59E0B', // amber-500
    },
  },

  // Fonts / Typography Configurations
  fonts: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Monaco, monospace',
  },

  // Consistent layouts and border styles
  layout: {
    borderRadius: {
      control: 'rounded-lg', // 8px for buttons/inputs
      card: 'rounded-xl',    // 12px for cards/modals
    },
    spacing: {
      xs: 'p-1',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
      gapSm: 'gap-2',
      gapMd: 'gap-4',
      gapLg: 'gap-6',
    },
    hairline: 'border border-transparent hairline dark:border-slate-800/60 shadow-sm',
  }
};
