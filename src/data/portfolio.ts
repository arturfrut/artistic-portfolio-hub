import { GalleryItem } from "@/components/gallery/GalleryGrid";
import obrasData from "./obras.json";
import exposicionesData from "./exposiciones.json";
import printsData from "./prints.json";
import prensaData from "./prensa.json";

// Interfaces
export interface Exhibition {
  id: string;
  title: string;
  venue: string;
  location: string;
  date: string;
  type: "solo" | "group";
  imageUrl?: string;
  description?: string;
  gallery?: string[];
}

export interface Print {
  id: string;
  title: string;
  imageUrl: string;
  edition: string;
  size: string;
  price?: string;
  available: boolean;
  gallery?: string[];
}

export interface PressItem {
  id: string;
  title: string;
  publication: string;
  date: string;
  excerpt?: string;
  link?: string;
  imageUrl?: string;
  gallery?: string[];
}

// Exportamos extrayendo el array de dentro del objeto
export const portfolioItems: GalleryItem[] = obrasData.obras as GalleryItem[];
export const exhibitions: Exhibition[] = exposicionesData.exposiciones as Exhibition[];
export const prints: Print[] = printsData.prints as Print[];
export const pressItems: PressItem[] = prensaData.prensa as PressItem[];