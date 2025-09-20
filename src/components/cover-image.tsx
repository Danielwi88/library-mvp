import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  src?: string | null;
  alt: string;
  index?: number;
  className?: string;
};

export default function CoverImage({ src, alt, index = 0, className }: Props) {
  const fallbacks = useMemo(() => ["/image1.png", "/image2.png", "/image3.png", "/image4.png"], []);
  const [fbIdx, setFbIdx] = useState(index % fallbacks.length);
  const [current, setCurrent] = useState<string>(src || fallbacks[fbIdx]);

  const onError = () => {
    const next = (fbIdx + 1) % fallbacks.length;
    setFbIdx(next);
    setCurrent(fallbacks[next]);
  };

  return <img src={current} onError={onError} alt={alt} className={cn(className)} />;
}

