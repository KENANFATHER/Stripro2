/**
 * Notification Styling Configuration
 * 
 * This file contains all customizable styling variables for the notification system.
 * Modify these values to customize the appearance and behavior of notifications
 * throughout the application.
 * 
 * Usage:
 * - Import and use these constants in notification components
 * - Modify values here to apply changes globally
 * - Add new style variables as needed for customization
 */

export const NOTIFICATION_THEME = {
  // Layout & Dimensions
  layout: {
    minWidth: '300px',
    maxWidth: '80vw',
    maxWidthMobile: '95vw',
    borderRadius: '8px',
  },
  
  // Spacing
  spacing: {
    paddingX: '20px',
    paddingXMobile: '16px',
    paddingY: '14px',
    paddingYMobile: '12px',
    iconTextGap: '12px',
    iconTextGapMobile: '10px',
    notificationGap: '0.75rem',
    notificationGapMobile: '0.5rem',
  },
  
  // Visual Effects
  effects: {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    boxShadowHover: '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
    borderWidth: '1px',
  },
  
  // Typography
  typography: {
    lineHeight: '1.4',
    lineHeightTitle: '1.3',
    titleFontSize: '0.875rem',
    titleFontSizeMobile: '0.875rem',
    messageFontSize: '0.875rem',
    messageFontSizeMobile: '0.8125rem',
    fontWeight: {
      title: '500',
      message: '400',
    },
  },
  
  // Animation
  animation: {
    transitionDuration: '200ms',
    slideDistance: '8px',
    staggerDelay: '50ms',
    scaleHover: '1.02',
    scalePressed: '0.98',
  },
  
  // Responsive
  responsive: {
    mobileBreakpoint: '768px',
    tabletBreakpoint: '1024px',
  },
  
  // Positioning
  positioning: {
    zIndex: 70,
    desktopTop: '1rem',
    mobileTop: '0.5rem',
    horizontalPadding: '1rem',
    maxWidth: '32rem',
  },
  
  // Color Variants
  colors: {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-800',
      message: 'text-green-700',
      closeButton: 'text-green-500 hover:text-green-700',
      accent: '#10b981',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      message: 'text-red-700',
      closeButton: 'text-red-500 hover:text-red-700',
      accent: '#ef4444',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      closeButton: 'text-yellow-500 hover:text-yellow-700',
      accent: '#f59e0b',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      message: 'text-blue-700',
      closeButton: 'text-blue-500 hover:text-blue-700',
      accent: '#3b82f6',
    },
  },
  
  // Accessibility
  accessibility: {
    focusRingWidth: '2px',
    focusRingColor: '#3b82f6',
    focusRingOffset: '2px',
    minTouchTarget: '44px',
  },
} as const;

/**
 * Utility function to get responsive styles
 */
export const getResponsiveStyles = (isMobile: boolean) => ({
  paddingX: isMobile ? NOTIFICATION_THEME.spacing.paddingXMobile : NOTIFICATION_THEME.spacing.paddingX,
  paddingY: isMobile ? NOTIFICATION_THEME.spacing.paddingYMobile : NOTIFICATION_THEME.spacing.paddingY,
  iconTextGap: isMobile ? NOTIFICATION_THEME.spacing.iconTextGapMobile : NOTIFICATION_THEME.spacing.iconTextGap,
  maxWidth: isMobile ? NOTIFICATION_THEME.layout.maxWidthMobile : NOTIFICATION_THEME.layout.maxWidth,
  titleFontSize: isMobile ? NOTIFICATION_THEME.typography.titleFontSizeMobile : NOTIFICATION_THEME.typography.titleFontSize,
  messageFontSize: isMobile ? NOTIFICATION_THEME.typography.messageFontSizeMobile : NOTIFICATION_THEME.typography.messageFontSize,
});

/**
 * Utility function to generate CSS custom properties
 */
export const generateCSSCustomProperties = () => {
  const theme = NOTIFICATION_THEME;
  
  return {
    '--notification-min-width': theme.layout.minWidth,
    '--notification-max-width': theme.layout.maxWidth,
    '--notification-border-radius': theme.layout.borderRadius,
    '--notification-padding-x': theme.spacing.paddingX,
    '--notification-padding-y': theme.spacing.paddingY,
    '--notification-icon-gap': theme.spacing.iconTextGap,
    '--notification-box-shadow': theme.effects.boxShadow,
    '--notification-box-shadow-hover': theme.effects.boxShadowHover,
    '--notification-transition': theme.animation.transitionDuration,
    '--notification-z-index': theme.positioning.zIndex.toString(),
  };
};

/**
 * Utility function to create custom notification themes
 */
export const createCustomTheme = (overrides: Partial<typeof NOTIFICATION_THEME>) => {
  return {
    ...NOTIFICATION_THEME,
    ...overrides,
  };
};

/**
 * Predefined theme variants
 */
export const NOTIFICATION_THEMES = {
  default: NOTIFICATION_THEME,
  
  compact: createCustomTheme({
    spacing: {
      ...NOTIFICATION_THEME.spacing,
      paddingX: '12px',
      paddingY: '8px',
      iconTextGap: '8px',
    },
    layout: {
      ...NOTIFICATION_THEME.layout,
      minWidth: '250px',
    },
  }),
  
  spacious: createCustomTheme({
    spacing: {
      ...NOTIFICATION_THEME.spacing,
      paddingX: '24px',
      paddingY: '18px',
      iconTextGap: '16px',
    },
    layout: {
      ...NOTIFICATION_THEME.layout,
      minWidth: '350px',
    },
  }),
  
  minimal: createCustomTheme({
    effects: {
      ...NOTIFICATION_THEME.effects,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      boxShadowHover: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    layout: {
      ...NOTIFICATION_THEME.layout,
      borderRadius: '4px',
    },
  }),
} as const;

export type NotificationTheme = typeof NOTIFICATION_THEME;
export type NotificationThemeVariant = keyof typeof NOTIFICATION_THEMES;