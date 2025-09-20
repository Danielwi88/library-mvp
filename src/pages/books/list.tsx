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
      'Business': PiggyBank,
      'Sci-Fi': FlaskConical,
      'Self-Help': Brain,
      'Education': GraduationCap,
      'Non-Fiction': BookMarked,
      'Technology': GraduationCap,
    };
    return map[name] ?? BookOpen;
  };
  const cats = (q.data ?? []) as Category[];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {cats.map((c)=>{
        const Icon = iconFor(c.name);
        return (
          <button key={c.id} onClick={()=>onClick(c.id)} className="text-left rounded-2xl border bg-white p-3 hover:shadow-sm">
            <div className="h-14 rounded-xl bg-[var(--color-primary-200,#D2E3FF)] grid place-items-center mb-2">
              <Icon className="size-6 text-primary" />
            </div>
            <div className="text-sm">{c.name}</div>
          </button>
        );
      })}
    </div>
  );
}
