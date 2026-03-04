import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Print } from "@/data/portfolio";
import { GalleryModal } from "@/components/gallery/GalleryModal";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useTranslation } from "react-i18next";

const Prints = () => {
  const { data: prints, loading } = usePortfolioData<Print>('prints.json', 'prints');
  const [selectedPrint, setSelectedPrint] = useState<Print | null>(null);
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === 'en';

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h1 className="section-title opacity-0 animate-fade-in-up">
            {t('prints.title')}
          </h1>

          <p className="text-muted-foreground max-w-2xl mb-12 opacity-0 animate-fade-in-up stagger-1">
            {t('prints.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prints.map((print, index) => {
              const edition = isEN && print.edition_en ? print.edition_en : print.edition
              const description = isEN && print.description_en ? print.description_en : print.description

              return (
                <div
                  key={print.id}
                  className="group opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div
                    className="gallery-item aspect-[4/5] mb-4 cursor-pointer"
                    onClick={() => setSelectedPrint(print)}
                  >
                    <img src={print.imageUrl} alt={print.title} loading="lazy" />
                    {!print.available && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                        <span className="text-sm uppercase tracking-wider text-muted-foreground">
                          {t('prints.soldOut')}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-display text-xl mb-1">{print.title}</h3>
                  <p className="text-muted-foreground text-sm mb-1">{edition}</p>
                  <p className="text-muted-foreground text-sm mb-2">{print.size}</p>
                  {description && (
                    <p className="text-muted-foreground text-sm mb-2">{description}</p>
                  )}
                  {print.price && print.available && (
                    <p className="text-primary font-medium">{print.price}</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-16 p-8 border border-border text-center opacity-0 animate-fade-in-up stagger-3">
            <h3 className="font-display text-2xl mb-4">{t('prints.interestedTitle')}</h3>
            <p className="text-muted-foreground mb-6">{t('prints.interestedText')}</p>
            <a
              href="mailto:ignaciocrevecoeur@gmail.com"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] border border-primary text-primary px-6 py-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {t('prints.contact')}
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