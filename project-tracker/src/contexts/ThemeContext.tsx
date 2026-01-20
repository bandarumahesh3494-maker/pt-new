import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeOption = 'corporate' | 'productivity' | 'tech' | 'agile' | 'modern' | 'executive' | 'light';

interface ThemeColors {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  border: string;
  text: string;
  textSecondary: string;
  headerBg: string;
  rowEven: string;
  rowOdd: string;
  accent: string;
  accentHover: string;
  plannedRowBg: string;
  actualRowBg: string;
  subtaskBg: string;
  subSubtaskBg: string;
  stickyColBg: string;
}

const themes: Record<ThemeOption, ThemeColors> = {
  corporate: {
    bg: 'bg-gray-900',
    bgSecondary: 'bg-gray-800',
    bgTertiary: 'bg-gray-700',
    border: 'border-gray-700',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    headerBg: 'bg-gray-800',
    rowEven: 'bg-gray-800/50',
    rowOdd: 'bg-gray-800/80',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    plannedRowBg: '#1f2937',
    actualRowBg: '#374151',
    subtaskBg: '#4b5563',
    subSubtaskBg: '#6b7280',
    stickyColBg: '#1f2937'
  },
  productivity: {
    bg: 'bg-slate-900',
    bgSecondary: 'bg-slate-800',
    bgTertiary: 'bg-slate-700',
    border: 'border-slate-600',
    text: 'text-slate-50',
    textSecondary: 'text-slate-300',
    headerBg: 'bg-slate-800',
    rowEven: 'bg-slate-800/50',
    rowOdd: 'bg-slate-800/80',
    accent: 'bg-sky-600',
    accentHover: 'hover:bg-sky-700',
    plannedRowBg: '#1e293b',
    actualRowBg: '#334155',
    subtaskBg: '#475569',
    subSubtaskBg: '#64748b',
    stickyColBg: '#1e293b'
  },
  tech: {
    bg: 'bg-zinc-950',
    bgSecondary: 'bg-zinc-900',
    bgTertiary: 'bg-zinc-800',
    border: 'border-zinc-700',
    text: 'text-zinc-50',
    textSecondary: 'text-zinc-300',
    headerBg: 'bg-zinc-900',
    rowEven: 'bg-zinc-900/50',
    rowOdd: 'bg-zinc-900/80',
    accent: 'bg-blue-500',
    accentHover: 'hover:bg-blue-600',
    plannedRowBg: '#18181b',
    actualRowBg: '#27272a',
    subtaskBg: '#3f3f46',
    subSubtaskBg: '#52525b',
    stickyColBg: '#18181b'
  },
  agile: {
    bg: 'bg-stone-900',
    bgSecondary: 'bg-stone-800',
    bgTertiary: 'bg-stone-700',
    border: 'border-stone-600',
    text: 'text-stone-50',
    textSecondary: 'text-stone-300',
    headerBg: 'bg-stone-800',
    rowEven: 'bg-stone-800/50',
    rowOdd: 'bg-stone-800/80',
    accent: 'bg-green-600',
    accentHover: 'hover:bg-green-700',
    plannedRowBg: '#1c1917',
    actualRowBg: '#292524',
    subtaskBg: '#44403c',
    subSubtaskBg: '#57534e',
    stickyColBg: '#1c1917'
  },
  modern: {
    bg: 'bg-slate-950',
    bgSecondary: 'bg-slate-900',
    bgTertiary: 'bg-slate-800',
    border: 'border-slate-700',
    text: 'text-slate-50',
    textSecondary: 'text-slate-300',
    headerBg: 'bg-slate-900',
    rowEven: 'bg-slate-900/50',
    rowOdd: 'bg-slate-900/80',
    accent: 'bg-teal-600',
    accentHover: 'hover:bg-teal-700',
    plannedRowBg: '#020617',
    actualRowBg: '#0f172a',
    subtaskBg: '#1e293b',
    subSubtaskBg: '#334155',
    stickyColBg: '#020617'
  },
  executive: {
    bg: 'bg-neutral-950',
    bgSecondary: 'bg-neutral-900',
    bgTertiary: 'bg-neutral-800',
    border: 'border-neutral-700',
    text: 'text-neutral-50',
    textSecondary: 'text-neutral-300',
    headerBg: 'bg-neutral-900',
    rowEven: 'bg-neutral-900/50',
    rowOdd: 'bg-neutral-900/80',
    accent: 'bg-amber-600',
    accentHover: 'hover:bg-amber-700',
    plannedRowBg: '#0a0a0a',
    actualRowBg: '#171717',
    subtaskBg: '#262626',
    subSubtaskBg: '#404040',
    stickyColBg: '#0a0a0a'
  },
  light: {
    bg: 'bg-gray-50',
    bgSecondary: 'bg-white',
    bgTertiary: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    headerBg: 'bg-gray-100',
    rowEven: 'bg-gray-50',
    rowOdd: 'bg-white',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    plannedRowBg: '#e5e7eb',
    actualRowBg: '#f3f4f6',
    subtaskBg: '#f9fafb',
    subSubtaskBg: '#ffffff',
    stickyColBg: '#e5e7eb'
  }
};

interface ThemeContextType {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeOption>(() => {
    const saved = localStorage.getItem('tracker-theme');
    const validThemes: ThemeOption[] = ['corporate', 'productivity', 'tech', 'warm'];
    return saved && validThemes.includes(saved as ThemeOption) ? (saved as ThemeOption) : 'corporate';
  });

  const setTheme = (newTheme: ThemeOption) => {
    setThemeState(newTheme);
    localStorage.setItem('tracker-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
