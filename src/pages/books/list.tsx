import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { fetchBooks } from "@/services/books";
import { fetchCategories, type Category } from "@/services/categories";
import type { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { BookMarked, BookOpen, Brain, FlaskConical, GraduationCap, PiggyBank } from "lucide-react";
import { useState, type ElementType } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCategories } from "@/features/ui/uiSlice";
import { useNavigate, Link } from "react-router-dom";

// style helper for hiding horizontal scrollbar in webkit
const NoScrollbar = () => (
  <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
);

export default function BookList() {
  const { search } = useSelector((s: RootState) => s.ui);
  const [page, setPage] = useState(1);
  const nav = useNavigate();
  const dispatch = useDispatch();
  

  const { data, isLoading, error } = useQuery({
    queryKey: ["books", { search, page }],
    queryFn: () => fetchBooks({ q: search, page, limit: 12 })
  });

  // derive simple popular authors list from current page data
  const authors = Array.from(new Map((data?.items ?? []).map(b => [b.author.id, b.author.name])).entries())
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <NoScrollbar />
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src="/heroAll.png"
          alt="Welcome to Booky"
          width={1200}
          height={441}
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-0 grid place-items-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            Welcome to <span className="block">Booky</span>
          </h2>
        </div>
      </div>
      {/* <div className="rounded-2xl overflow-hidden border bg-[var(--color-primary-200,#D2E3FF)]">
        <div className="p-6 md:p-8">
          <p className="text-sm text-neutral-700 mt-1">Discover inspiring stories & timeless knowledge</p>
        </div>
      </div> */}

      <HomeCategories onClick={(id)=>{ dispatch(setCategories([id])); nav('/categories'); }} />

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Failed to load</p>}

      <h3 className="text-lg font-semibold">Recommendation</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data?.items?.map((b, i) => (
          <ProductCard
            key={b.id}
            id={b.id}
            title={b.title}
            authorName={b.author.name}
            authorId={b.author.id}
            coverUrl={b.coverUrl}
            rating={b.rating}
            index={i}
          />
        ))}
      </div>

      {data?.items && (
        <div className="flex justify-center">
          <Button className="rounded-full" variant="outline" onClick={() => setPage(p => p+1)}>Load More</Button>
        </div>
      )}

      {/* Popular Authors */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Popular Authors</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {authors.map(([id, name]) => (
            <div key={id} className="rounded-xl border p-3 text-center">
              <Link to={`/authors/${id}`} className="group block">
                <div className="mx-auto size-10 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold group-hover:bg-primary/20">
                  {name.split(' ').map(p=>p[0]).slice(0,2).join('')}
                </div>
                <div className="mt-2 text-sm font-medium truncate underline-offset-4 group-hover:underline">{name}</div>
              </Link>
              <div className="text-xs text-muted-foreground">5 books</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeCategories({ onClick }: { onClick: (id: string) => void }) {
  const q = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const iconFor = (name: string) => {
    const map: Record<string, ElementType> = {
      'Fiction': BookOpen,
      'Non-Fiction': BookMarked,
      'Self Improvement': Brain,
      'Finance': PiggyBank,
      'Science': FlaskConical,
      'Education': GraduationCap,
    };
    return map[name] ?? BookOpen;
  };
  const cats = (q.data ?? []) as Category[];
  const fallback: Pick<Category,'id'|'name'>[] = [
    { id: 1, name: 'Fiction' },
    { id: 2, name: 'Non-Fiction' },
    { id: 3, name: 'Self-Improvement' },
    { id: 4, name: 'Finance' },
    { id: 5, name: 'Science' },
    { id: 6, name: 'Education' },
  ];
  const items = cats.length ? cats : fallback;
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Categories</h3>

      {/* Loading state */}
      {q.isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white p-4 animate-pulse">
              <div className="h-14 rounded-xl bg-blue-100/70 mb-2" />
              <div className="h-3 w-24 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error message (still show fallback cards) */}
      {q.error && (
        <p className="text-sm text-red-500">Failed to load categories — showing defaults.</p>
      )}

      {/* Cards (API or fallback) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((c) => {
          const Icon = iconFor(c.name);
          return (
            <button
              key={String(c.id)}
              onClick={() => onClick(String(c.id))}
              className="text-left rounded-2xl border bg-white p-4 shadow-[0_6px_14px_rgba(20,30,55,0.06)] hover:shadow-[0_10px_20px_rgba(20,30,55,0.08)] transition-shadow"
            >
              <div className="h-14 rounded-xl bg-blue-100 grid place-items-center mb-2">
                <Icon className="size-7 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-neutral-900 leading-snug">{c.name}</div>
            </button>
          );
        })}
      </div>

      {/* Empty hint if API loaded but had no categories */}
      {!q.isLoading && !q.error && cats.length === 0 && (
        <p className="text-sm text-muted-foreground">No categories from the API yet. Using placeholders.</p>
      )}
    </div>
  );
}
