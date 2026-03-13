export const tailwindConfig = {
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  colors: {
    border: 'hsl(var(--color-border))',
    input: 'hsl(var(--color-input))',
    ring: 'hsl(var(--color-ring))',
    background: 'hsl(var(--color-background))',
    foreground: 'hsl(var(--color-foreground))',
    primary: {
      DEFAULT: 'hsl(var(--color-primary))',
      foreground: 'hsl(var(--color-primary-foreground))',
    },
    secondary: {
      DEFAULT: 'hsl(var(--color-secondary))',
      foreground: 'hsl(var(--color-secondary-foreground))',
    },
    destructive: {
      DEFAULT: 'hsl(var(--color-destructive))',
      foreground: 'hsl(var(--color-destructive-foreground))',
    },
    muted: {
      DEFAULT: 'hsl(var(--color-muted))',
      foreground: 'hsl(var(--color-muted-foreground))',
    },
    accent: {
      DEFAULT: 'hsl(var(--color-accent))',
      foreground: 'hsl(var(--color-accent-foreground))',
    },
    card: {
      DEFAULT: 'hsl(var(--color-card))',
      foreground: 'hsl(var(--color-card-foreground))',
    },
  },
  borderRadius: {
    lg: 'var(--radius-lg)',
    md: 'var(--radius-md)',
    sm: 'var(--radius-sm)',
  },
  container: {
    center: true,
    padding: '2rem',
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1400px',
    },
  },
}
