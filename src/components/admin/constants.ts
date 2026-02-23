import { ContentType } from './types';

export const FILE_PATHS: Record<ContentType, string> = {
  obras: 'public/data/obras.json',
  exposiciones: 'public/data/exposiciones.json',
  prints: 'public/data/prints.json',
  prensa: 'public/data/prensa.json',
  carrusel: 'public/data/carrusel.json',
};

export const JSON_KEYS: Record<ContentType, string> = {
  obras: 'obras',
  exposiciones: 'exposiciones',
  prints: 'prints',
  prensa: 'prensa',
  carrusel: 'carrusel',
};

export const TAB_LABELS: Record<ContentType, string> = {
  obras: 'Obras',
  exposiciones: 'Exposiciones',
  prints: 'Prints',
  prensa: 'Prensa',
  carrusel: 'Carrusel Inicio',
};

export const STORAGE_KEY = 'portfolio_admin_enc';
export const STORAGE_SALT = 'portfolio_admin_salt';
export const STORAGE_IV = 'portfolio_admin_iv';