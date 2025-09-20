import ProductCard from "@/components/product-card";
import { fetchBooks } from "@/services/books";
import { fetchCategories, type Category } from "@/services/categories";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { setCategories, toggleCategory } from "@/features/ui/uiSlice";

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const selected = useSelector((s: RootState) => s.ui.categoryIds);
  const [minRating, setMinRating] = useState<number>(0);

  const booksQ = useQuery({ queryKey: ['books', { page: 1 }], queryFn: () => fetchBooks({ page: 1, limit: 40 }) });
  const catsQ = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  // If opened via URL with preselect, ensure state synced (handled by Home on click as well)
  useEffect(() => {
    if (!selected.length && catsQ.data?.length) {
      dispatch(setCategories([]));
    }
  }, [catsQ.data, selected.length, dispatch]);

  const filtered = useMemo(() => {
    const items = booksQ.data?.items ?? [];
    return items.filter(b => {
      const hitCat = selected.length === 0 || b.categories.some(c => selected.includes(c.id));
      const hitRating = (b.rating ?? 0) >= minRating;
      return hitCat && hitRating;
    });
  }, [booksQ.data, selected, minRating]);

  return (
    <div className="grid md:grid-cols-[260px,1fr] gap-6">
      <aside className="ds-card p-4 h-fit">
        <div className="font-semibold mb-3">Filter</div>
        <div className="mb-3">
          <div className="text-sm text-muted-foreground mb-2">Category</div>
          <div className="space-y-2">
            {(catsQ.data ?? []).map((c: Category) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selected.includes(c.id)} onChange={()=>dispatch(toggleCategory(c.id))} />
                {c.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-2">Rating</div>
          <div className="space-y-1 text-sm">
            {[0,1,2,3,4].map(r => (
              <label key={r} className="flex items-center gap-2">
                <input type="radio" name="rating" checked={minRating===r} onChange={()=>setMinRating(r)} />
                {r === 0 ? 'All' : `${r}+`}
              </label>
            ))}
          </div>
        </div>
      </aside>

      <section className="space-y-4">
        <h1 className="text-lg font-semibold">Book List</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((b, i) => (
            <ProductCard key={b.id} id={b.id} title={b.title} authorName={b.author.name} coverUrl={b.coverUrl} rating={b.rating} index={i} />
          ))}
        </div>
        {booksQ.isLoading && <p>Loading...</p>}
        {booksQ.error && <p className="text-red-500">Failed to load</p>}
      </section>
    </div>
  );
}

