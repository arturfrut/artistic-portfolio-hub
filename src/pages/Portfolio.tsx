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


  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h1 className="section-title opacity-0 animate-fade-in-up">Portfolio</h1>

          <GalleryGrid items={portfolioItems} columns={3} />
        </div>
      </section>
    </Layout>
  );
};

export default Portfolio;
