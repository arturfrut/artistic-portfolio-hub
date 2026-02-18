import { ContentType } from './types';

export const FILE_PATHS: Record<ContentType, string> = {
  obras: 'src/data/obras.json',
  exposiciones: 'src/data/exposiciones.json',
  prints: 'src/data/prints.json',
  prensa: 'src/data/prensa.json',
};

export const JSON_KEYS: Record<ContentType, string> = {
  obras: 'obras',
  exposiciones: 'exposiciones',
  prints: 'prints',
  prensa: 'prensa',
};

export const TAB_LABELS: Record<ContentType, string> = {
  obras: 'Obras',
  exposiciones: 'Exposiciones',
  prints: 'Prints',
  prensa: 'Prensa',
};

export const STORAGE_KEY = 'portfolio_admin_enc';
export const STORAGE_SALT = 'portfolio_admin_salt';
export const STORAGE_IV = 'portfolio_admin_iv';