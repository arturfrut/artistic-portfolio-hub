import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { portfolioItems } from "@/data/portfolio";

const categories = [
  { id: "all", label: "Todo" },
  { id: "paintings", label: "Pinturas" },
  { id: "works-on-paper", label: "Obras en papel" },
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems =
    activeCategory === "all"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h1 className="section-title opacity-0 animate-fade-in-up">Portfolio</h1>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-6 mb-12 opacity-0 animate-fade-in-up stagger-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`nav-link ${
                  activeCategory === category.id ? "active" : ""
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <GalleryGrid items={filteredItems} columns={3} />
        </div>
      </section>
    </Layout>
  );
};

export default Portfolio;
