import type { ThemeContextType } from '@/@types/interface/theme.interface';
import { createContext } from 'react';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
