import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

type Props = {
  id: string | number;
  title: string;
  authorName: string;
  authorId?: string | number;
  coverUrl?: string | null;
  rating?: number;
  index?: number; // used to start fallback sequence deterministically
  compact?: boolean; // tighter padding for sidebars/related
  showDetailButton?: boolean;
  className?: string;
};

export function ProductCard({ id, title, authorName, authorId, coverUrl, rating = 0, index = 0, compact = false, showDetailButton = false, className = "" }: Props) {
  const fallbacks = useMemo(() => ["/image1.png", "/image2.png", "/image3.png", "/image4.png"], []);
  const [fbIdx, setFbIdx] = useState(index % fallbacks.length);
  const [src, setSrc] = useState<string>(coverUrl || fallbacks[fbIdx]);

  useEffect(() => {
    // Reset when cover changes
    if (coverUrl) setSrc(coverUrl);
    else setSrc(fallbacks[fbIdx]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverUrl]);

  const onError = () => {
    const next = (fbIdx + 1) % fallbacks.length;
    setFbIdx(next);
    setSrc(fallbacks[next]);
  };

  const infoPad = compact ? "p-2" : "p-3";

  const navigate = useNavigate();

  return (
    <Link to={`/books/${id}`} className={`rounded-2xl overflow-hidden border bg-white block ${className}`}>
      <Card className="rounded-2xl overflow-hidden border-0">
        <CardContent className="p-0">
          <img src={src} onError={onError} alt={title} className="w-full h-[336px] object-cover" />
          <div className={infoPad}>
            <div className="font-semibold truncate" title={title}>{title}</div>
            <div className="text-sm text-muted-foreground truncate">
              {authorId !== undefined ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/authors/${authorId}`);
                  }}
                  className="underline underline-offset-2 hover:opacity-80 focus:outline-none"
                >
                  {authorName}
                </button>
              ) : (
                authorName
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm inline-flex items-center gap-1">
                <img src="/star.svg" alt="rating" className="w-3.5 h-3.5" />
                {rating.toFixed(1)}
              </span>
              {showDetailButton && (
                <Button size="sm" variant="outline" className="rounded-full" asChild>
                  <span>Detail</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ProductCard;
