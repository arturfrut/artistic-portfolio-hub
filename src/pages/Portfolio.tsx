import { Layout } from "@/components/layout/Layout";
import { GalleryGrid, GalleryItem } from "@/components/gallery/GalleryGrid";
import { usePortfolioData } from "@/hooks/usePortfolioData";

const Portfolio = () => {
  const { data: portfolioItems, loading } = usePortfolioData<GalleryItem>('obras.json', 'obras');

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h1 className="section-title opacity-0 animate-fade-in-up">Portfolio</h1>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando...</div>
          ) : (
            <GalleryGrid items={portfolioItems} columns={3} />
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Portfolio;