import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { prints } from "@/data/portfolio";
import { GalleryModal } from "@/components/gallery/GalleryModal";

const Prints = () => {
  const [selectedPrint, setSelectedPrint] = useState<typeof prints[0] | null>(null);

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h1 className="section-title opacity-0 animate-fade-in-up">Prints</h1>

          <p className="text-muted-foreground max-w-2xl mb-12 opacity-0 animate-fade-in-up stagger-1">
            Ediciones limitadas de alta calidad, impresas en papel fine art con
            tintas de archivo. Cada print está firmado y numerado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prints.map((print, index) => (
              <div
                key={print.id}
                className="group opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div 
                  className="gallery-item aspect-[4/5] mb-4 cursor-pointer"
                  onClick={() => setSelectedPrint(print)}
                >
                  <img
                    src={print.imageUrl}
                    alt={print.title}
                    loading="lazy"
                  />
                  {!print.available && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                      <span className="text-sm uppercase tracking-wider text-muted-foreground">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-display text-xl mb-1">{print.title}</h3>
                <p className="text-muted-foreground text-sm mb-1">
                  {print.edition}
                </p>
                <p className="text-muted-foreground text-sm mb-2">{print.size}</p>
                {print.price && print.available && (
                  <p className="text-primary font-medium">{print.price}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 border border-border text-center opacity-0 animate-fade-in-up stagger-3">
            <h3 className="font-display text-2xl mb-4">¿Interesado en un print?</h3>
            <p className="text-muted-foreground mb-6">
              Contactame para consultas sobre disponibilidad, encargos especiales
              o información de envío.
            </p>
            <a
              href="mailto:contact@ignaciocevecoeur.com"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] border border-primary text-primary px-6 py-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              Contactar
            </a>
          </div>
        </div>
      </section>

      <GalleryModal
        item={selectedPrint ? { ...selectedPrint, itemType: "print" as const } : null}
        onClose={() => setSelectedPrint(null)}
      />
    </Layout>
  );
};

export default Prints;