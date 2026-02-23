// Interfaces
export interface GalleryMedia {
  type: 'image' | 'video';
  image?: string;
  videoUrl?: string;
}
export interface Exhibition {
  id: string;
  title: string;
  venue: string;
  location: string;
  date: string;
  type: "solo" | "group";
  imageUrl?: string;
  description?: string;
  gallery?: GalleryMedia[];
}

export interface Print {
  id: string;
  title: string;
  imageUrl: string;
  edition: string;
  size: string;
  price?: string;
  available: boolean;
  description?: string;
  gallery?: GalleryMedia[];
}

export interface PressItem {
  id: string;
  title: string;
  publication: string;
  date: string;
  excerpt?: string;
  link?: string;
  imageUrl?: string;
  gallery?: GalleryMedia[];
}

