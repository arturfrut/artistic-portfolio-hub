import { useState } from "react";
import { GalleryModal } from "./GalleryModal";

export interface GalleryItem {
  id: string;
  title: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  imageUrl: string;
  category?: string;
  gallery?: string[];
}

interface GalleryGridProps {
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
}

export function GalleryGrid({ items, columns = 3 }: GalleryGridProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  return (
    <>
      <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="gallery-item aspect-[4/5] opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleItemClick(item)}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="font-display text-xl text-foreground">{item.title}</h3>
              {item.year && (
                <p className="text-muted-foreground text-sm mt-1">{item.year}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <GalleryModal
        item={selectedItem ? { ...selectedItem, itemType: "artwork" as const } : null}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}