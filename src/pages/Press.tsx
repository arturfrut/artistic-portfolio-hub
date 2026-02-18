import { Layout } from "@/components/layout/Layout";
import { PressItem } from "@/data/portfolio";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { ArrowUpRight } from "lucide-react";

const Press = () => {
    const { data: pressItems, loading } = usePortfolioData<PressItem>(
      'prensa.json',
      'prensa'
    )
  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h1 className="section-title opacity-0 animate-fade-in-up">Press</h1>

          <div className="space-y-12">
            {pressItems.map((item, index) => (
              <article
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-border pb-12 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                {item.imageUrl && (
                  <div className="gallery-item aspect-[16/10]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className={item.imageUrl ? "md:col-span-2" : "md:col-span-3"}>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-primary text-sm uppercase tracking-wider">
                      {item.publication}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {item.date}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl mb-4">
                    {item.title}
                  </h2>
                  {item.excerpt && (
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {item.excerpt}
                    </p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm uppercase tracking-[0.15em] text-secondary hover:text-foreground transition-colors"
                    >
                      Leer artículo
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 text-center opacity-0 animate-fade-in-up stagger-4">
            <p className="text-muted-foreground">
              Para consultas de prensa, contactar:{" "}
              <a
                href="mailto:press@ignaciocevecoeur.com"
                className="text-secondary hover:text-foreground transition-colors"
              >
                press@ignaciocevecoeur.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Press;
