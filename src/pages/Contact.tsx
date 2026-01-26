import { Layout } from "@/components/layout/Layout";
import { Instagram, Mail, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <Layout>
      <section className="py-12 min-h-[70vh] flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="section-title opacity-0 animate-fade-in-up">Contact</h1>

            <div className="space-y-8 opacity-0 animate-fade-in-up stagger-1">
              <div className="flex items-center justify-center gap-3">
                <Mail className="text-primary" size={20} />
                <a
                  href="mailto:contact@ignaciocevecoeur.com"
                  className="text-lg hover:text-primary transition-colors"
                >
                  contact@ignaciocevecoeur.com
                </a>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Instagram className="text-secondary" size={20} />
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg hover:text-secondary transition-colors"
                >
                  @ignaciocevecoeur
                </a>
              </div>

              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <MapPin size={20} />
                <span className="text-lg">Buenos Aires, Argentina</span>
              </div>
            </div>

            <div className="mt-16 pt-12 border-t border-border opacity-0 animate-fade-in-up stagger-2">
              <h2 className="font-display text-2xl mb-6">Representación</h2>
              <p className="text-muted-foreground">
                Galería Arte Contemporáneo
                <br />
                Av. Alvear 1234, Recoleta
                <br />
                Buenos Aires, Argentina
              </p>
            </div>

            <div className="mt-12 opacity-0 animate-fade-in-up stagger-3">
              <p className="text-sm text-muted-foreground">
                Para consultas sobre obras, comisiones o colaboraciones,
                <br />
                no dudes en contactarme.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
