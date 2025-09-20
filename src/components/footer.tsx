import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Music2 as Tiktok } from 'lucide-react';

function BookyMark({ className = 'size-6 text-primary' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 42 42"
      className={className}
      fill="none"
      aria-hidden
    >
      <mask id="booky_mask_footer" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="42" height="42">
        <path d="M42 0H0V42H42V0Z" fill="white" />
      </mask>
      <g mask="url(#booky_mask_footer)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.5 0H19.5V13.2832L14.524 0.967222L11.7425 2.09104L16.8474 14.726L7.21142 5.09009L5.09011 7.21142L14.3257 16.447L2.35706 11.2178L1.15596 13.9669L13.8202 19.5H0V22.5H13.8202L1.15597 28.0331L2.35706 30.7822L14.3257 25.553L5.09011 34.7886L7.21142 36.9098L16.8474 27.274L11.7425 39.909L14.524 41.0327L19.5 28.7169V42H22.5V28.7169L27.476 41.0327L30.2574 39.909L25.1528 27.274L34.7886 36.9098L36.9098 34.7886L27.6742 25.553L39.643 30.7822L40.8439 28.0331L28.1799 22.5H42V19.5H28.1797L40.8439 13.9669L39.643 11.2178L27.6742 16.447L36.9098 7.2114L34.7886 5.09009L25.1528 14.726L30.2574 2.09104L27.476 0.967222L22.5 13.2832V0Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t mt-16 bg-white">
      <div className="container mx-auto max-w-6xl px-3 py-10 sm:py-14 text-center">
        <Link to="/" className="inline-flex items-center gap-2 justify-center font-semibold">
          <BookyMark className="size-6 sm:size-7 text-primary" />
          <span className="text-lg font-extrabold">Booky</span>
        </Link>
        <p className="mt-3 text-sm text-neutral-700 max-w-2xl mx-auto">
          Discover inspiring stories & timeless knowledge, ready to borrow anytime. Explore online or visit our nearest library branch.
        </p>
        <p className="mt-6 text-sm text-neutral-600">Follow on Social Media</p>
        <div className="mt-3 flex items-center justify-center gap-3 text-neutral-700">
          <a href="#" aria-label="Facebook" className="size-9 grid place-items-center rounded-full border hover:bg-neutral-50">
            <Facebook className="size-4" />
          </a>
          <a href="#" aria-label="Instagram" className="size-9 grid place-items-center rounded-full border hover:bg-neutral-50">
            <Instagram className="size-4" />
          </a>
          <a href="#" aria-label="LinkedIn" className="size-9 grid place-items-center rounded-full border hover:bg-neutral-50">
            <Linkedin className="size-4" />
          </a>
          <a href="#" aria-label="TikTok" className="size-9 grid place-items-center rounded-full border hover:bg-neutral-50">
            <Tiktok className="size-4" />
          </a>
        </div>
        <div className="mt-6 text-xs text-neutral-500">© {new Date().getFullYear()} Booky</div>
      </div>
    </footer>
  );
}
