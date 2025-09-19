import { Link } from 'react-router-dom';
import { Asterisk, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t mt-10">
      <div className="container mx-auto max-w-6xl px-3 py-10 text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2 justify-center font-semibold">
          <Asterisk className="size-5 text-primary" />
          <span>Booky</span>
        </Link>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Discover inspiring stories & timeless knowledge. Keep learning, explore libraries,
          and write your next chapter with Booky.
        </p>
        <div className="flex items-center justify-center gap-4 text-muted-foreground">
          <a href="#" aria-label="Instagram" className="p-2 rounded-full border">
            <Instagram className="size-4" />
          </a>
          <a href="#" aria-label="Twitter" className="p-2 rounded-full border">
            <Twitter className="size-4" />
          </a>
          <a href="#" aria-label="Facebook" className="p-2 rounded-full border">
            <Facebook className="size-4" />
          </a>
        </div>
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Booky</div>
      </div>
    </footer>
  );
}

