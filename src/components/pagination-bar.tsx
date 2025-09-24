import { cn } from "@/lib/utils";

type Props = {
  page: number;          
  pageSize: number;      
  total: number;         
  onPageChange: (p: number) => void;
  className?: string;
};

function pageRange(page: number, totalPages: number) {
  
  const delta = 1;
  const range: (number | string)[] = [];
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);

  range.push(1);
  if (left > 2) range.push("…");
  for (let p = left; p <= right; p++) range.push(p);
  if (right < totalPages - 1) range.push("…");
  if (totalPages > 1) range.push(totalPages);
  return range;
}

export default function PaginationBar({
  page, pageSize, total, onPageChange, className,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const pages = pageRange(page, totalPages);

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", className)}>
      {/* Left: showing range */}
      <p className="text-sm text-neutral-500">
        Showing <span className="font-medium text-neutral-700">{start}</span> to{" "}
        <span className="font-medium text-neutral-700">{end}</span> of{" "}
        <span className="font-medium text-neutral-700">{total}</span> entries
      </p>

      {/* Right: pagination controls */}
      <nav className="flex items-center gap-2" aria-label="Pagination">
        <button
          className={cn(
            "h-9 px-3 rounded-full border text-sm",
            page === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-neutral-50"
          )}
          onClick={() => page > 1 && onPageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>

        {pages.map((p, i) =>
          typeof p === "string" ? (
            <span key={`dots-${i}`} className="px-2 text-neutral-400 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "h-9 min-w-9 px-3 rounded-full border text-sm",
                p === page
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "hover:bg-neutral-50"
              )}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          className={cn(
            "h-9 px-3 rounded-full border text-sm",
            page >= totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-neutral-50"
          )}
          onClick={() => page < totalPages && onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </nav>
    </div>
  );
}