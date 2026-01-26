import { Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 mt-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground text-sm tracking-wide">
            © {new Date().getFullYear()} Ignacio Crevecoeur. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="mailto:contact@ignaciocevecoeur.com"
              className="text-muted-foreground hover:text-secondary transition-colors duration-300"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
