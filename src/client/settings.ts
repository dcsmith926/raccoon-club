import { createContext } from 'react';
import { defaultSettings } from '../common/UserSettings';

export const SettingsContext = createContext(defaultSettings);