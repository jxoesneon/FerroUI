// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { createContext } from 'react';
import { I18nContextValue } from './types.js';

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
