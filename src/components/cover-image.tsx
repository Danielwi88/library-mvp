import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  src?: string | null;
  alt: string;
  index?: number;
  className?: string;
};

const FALLBACKS = ["/image1.png", "/image2.png", "/image3.png", "/image4.png"] as const;
const DEFAULT_FALLBACK = "/image1.png";

export default function CoverImage({ src, alt, index = 0, className }: Props) {
  const fallbackCount = FALLBACKS.length as number;
  const normalizedIndex = fallbackCount > 0 ? ((index % fallbackCount) + fallbackCount) % fallbackCount : 0;
  const fallbackForIndex = FALLBACKS[normalizedIndex] ?? DEFAULT_FALLBACK;

  const [fbIdx, setFbIdx] = useState(normalizedIndex);
  const [current, setCurrent] = useState<string>(() =>
    typeof src === "string" && src.trim().length > 0 ? src : fallbackForIndex
  );

  useEffect(() => {
    const nextIdx = normalizedIndex;
    setFbIdx(nextIdx);

    if (typeof src === "string" && src.trim().length > 0) {
      setCurrent(src);
      return;
    }

    const nextFallback = FALLBACKS[nextIdx] ?? DEFAULT_FALLBACK;
    setCurrent(nextFallback);
  }, [src, normalizedIndex, fallbackForIndex]);

  const handleError = () => {
    if (fallbackCount === 0) return;
    const nextIdx = (fbIdx + 1) % fallbackCount;
    const nextSrc = FALLBACKS[nextIdx] ?? DEFAULT_FALLBACK;
    if (current !== nextSrc) {
      setFbIdx(nextIdx);
      setCurrent(nextSrc);
    }
  };

  return <img src={current} onError={handleError} alt={alt} className={cn(className)} />;
}
