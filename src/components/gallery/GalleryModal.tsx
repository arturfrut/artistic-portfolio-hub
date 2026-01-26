import { useEffect } from "react";
import { X } from "lucide-react";
import { GalleryItem } from "./GalleryGrid";

interface GalleryModalProps {
  item: GalleryItem | null;
  onClose: () => void;
}

export function GalleryModal({ item, onClose }: GalleryModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (item) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors z-50"
        aria-label="Close modal"
      >
        <X size={32} />
      </button>

      <div
        className="max-w-5xl max-h-[90vh] mx-6 flex flex-col md:flex-row gap-8 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 flex items-center justify-center">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-h-[80vh] w-auto object-contain"
          />
        </div>

        <div className="md:w-72 flex flex-col justify-end pb-8">
          <h2 className="font-display text-3xl mb-4">{item.title}</h2>
          {item.year && (
            <p className="text-muted-foreground mb-2">{item.year}</p>
          )}
          {item.medium && (
            <p className="text-muted-foreground text-sm mb-1">{item.medium}</p>
          )}
          {item.dimensions && (
            <p className="text-muted-foreground text-sm">{item.dimensions}</p>
          )}
        </div>
      </div>
    </div>
  );
}
