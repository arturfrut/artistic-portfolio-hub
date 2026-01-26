import artwork1 from "@/assets/artwork-1.jpg";
import artwork2 from "@/assets/artwork-2.jpg";
import artwork3 from "@/assets/artwork-3.jpg";
import artwork4 from "@/assets/artwork-4.jpg";
import artwork5 from "@/assets/artwork-5.jpg";
import artwork6 from "@/assets/artwork-6.jpg";
import { GalleryItem } from "@/components/gallery/GalleryGrid";

// This data will be managed by TinaCMS later
export const portfolioItems: GalleryItem[] = [
  {
    id: "1",
    title: "Fragmentos del Silencio I",
    year: "2024",
    medium: "Óleo sobre lienzo",
    dimensions: "150 x 120 cm",
    imageUrl: artwork1,
    category: "paintings",
  },
  {
    id: "2",
    title: "La Danza del Caos",
    year: "2024",
    medium: "Acrílico y técnica mixta",
    dimensions: "180 x 140 cm",
    imageUrl: artwork2,
    category: "paintings",
  },
  {
    id: "3",
    title: "Ecos de Luz",
    year: "2023",
    medium: "Óleo sobre lienzo",
    dimensions: "100 x 80 cm",
    imageUrl: artwork3,
    category: "paintings",
  },
  {
    id: "4",
    title: "Naturaleza Abstracta",
    year: "2023",
    medium: "Técnica mixta sobre papel",
    dimensions: "70 x 50 cm",
    imageUrl: artwork4,
    category: "works-on-paper",
  },
  {
    id: "5",
    title: "Constelaciones Urbanas",
    year: "2023",
    medium: "Acrílico sobre lienzo",
    dimensions: "200 x 160 cm",
    imageUrl: artwork5,
    category: "paintings",
  },
  {
    id: "6",
    title: "El Peso del Vacío",
    year: "2022",
    medium: "Óleo y carbón",
    dimensions: "120 x 100 cm",
    imageUrl: artwork6,
    category: "paintings",
  },
];

export interface Exhibition {
  id: string;
  title: string;
  venue: string;
  location: string;
  date: string;
  type: "solo" | "group";
  imageUrl?: string;
  description?: string;
}

export const exhibitions: Exhibition[] = [
  {
    id: "1",
    title: "Fragmentos del Alma",
    venue: "Galería Arte Contemporáneo",
    location: "Buenos Aires, Argentina",
    date: "2024",
    type: "solo",
    imageUrl: artwork1,
    description: "Una exploración de la identidad fragmentada a través del color y la forma.",
  },
  {
    id: "2",
    title: "Visiones Latinoamericanas",
    venue: "Museo de Arte Moderno",
    location: "Ciudad de México, México",
    date: "2023",
    type: "group",
  },
  {
    id: "3",
    title: "El Silencio Habla",
    venue: "Centro Cultural Recoleta",
    location: "Buenos Aires, Argentina",
    date: "2023",
    type: "solo",
    imageUrl: artwork3,
  },
  {
    id: "4",
    title: "Arte Emergente del Sur",
    venue: "MALBA",
    location: "Buenos Aires, Argentina",
    date: "2022",
    type: "group",
  },
];

export interface Print {
  id: string;
  title: string;
  imageUrl: string;
  edition: string;
  size: string;
  price?: string;
  available: boolean;
}

export const prints: Print[] = [
  {
    id: "1",
    title: "Fragmentos I",
    imageUrl: artwork1,
    edition: "Edición limitada de 50",
    size: "60 x 40 cm",
    price: "$350",
    available: true,
  },
  {
    id: "2",
    title: "La Danza",
    imageUrl: artwork2,
    edition: "Edición limitada de 30",
    size: "80 x 60 cm",
    price: "$500",
    available: true,
  },
  {
    id: "3",
    title: "Ecos",
    imageUrl: artwork3,
    edition: "Edición limitada de 50",
    size: "50 x 40 cm",
    price: "$280",
    available: false,
  },
];

export interface PressItem {
  id: string;
  title: string;
  publication: string;
  date: string;
  excerpt?: string;
  link?: string;
  imageUrl?: string;
}

export const pressItems: PressItem[] = [
  {
    id: "1",
    title: "El nuevo lenguaje visual de Ignacio Crevecoeur",
    publication: "Revista Ñ - Clarín",
    date: "Marzo 2024",
    excerpt: "Una mirada profunda al trabajo del artista que está redefiniendo el arte contemporáneo argentino.",
    link: "#",
    imageUrl: artwork5,
  },
  {
    id: "2",
    title: "Artistas emergentes a seguir en 2024",
    publication: "Art Forum",
    date: "Enero 2024",
    excerpt: "Selección de los artistas más prometedores del panorama latinoamericano.",
    link: "#",
  },
  {
    id: "3",
    title: "La abstracción como resistencia",
    publication: "La Nación",
    date: "Noviembre 2023",
    excerpt: "Entrevista exclusiva sobre el proceso creativo y la búsqueda de nuevas formas de expresión.",
    link: "#",
  },
];
