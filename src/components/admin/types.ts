export interface GalleryMedia {
  type: 'image' | 'video';
  image?: string;
  videoUrl?: string;
}

export interface BaseItem {
  id: string;
  title: string;
  imageUrl?: string;
  gallery?: GalleryMedia[];
  published?: boolean;
}

export interface Obra extends BaseItem {
  year: string;
  medium: string;
  medium_en?: string;
  dimensions: string;
}

export interface Exposicion extends BaseItem {
  venue: string;
  location: string;
  date: string;
  description?: string;
}

export interface Print extends BaseItem {
  imageUrl: string;
  edition: string;
  size: string;
  price?: string;
  available: boolean;
  description?: string;
}

export interface PressItem extends BaseItem {
  publication: string;
  date: string;
  excerpt?: string;
  link?: string;
}

export interface CarouselItem extends BaseItem {
  imageUrl: string;
  caption?: string;
}

export type ContentType = 'obras' | 'exposiciones' | 'prints' | 'prensa' | 'carrusel';
export type AnyItem = Obra | Exposicion | Print | PressItem | CarouselItem;
