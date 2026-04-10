import React, { createContext } from 'react';
import { I18nContextValue } from './types';

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
