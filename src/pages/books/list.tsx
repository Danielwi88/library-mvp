import { useQuery } from "@tanstack/react-query";
import { fetchBooks } from "@/services/books";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BookOpen, BookMarked, Brain, FlaskConical, GraduationCap, PiggyBank } from "lucide-react";

export default function BookList() {
  const { search } = useSelector((s: RootState) => s.ui);
  const [page, setPage] = useState(1);

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
      <div className="rounded-xl overflow-hidden border bg-primary-50">
        <div className="bg-gradient-to-r from-primary-200/60 to-transparent p-6 md:p-8">
          <h2 className="text-display-sm font-semibold">Welcome to Booky</h2>
          <p className="text-sm text-muted-foreground mt-1">Find your next great read</p>
        </div>
      </div>

      {/* Categories row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Fiction', icon: BookOpen },
          { label: 'Non-Fiction', icon: BookMarked },
          { label: 'Self-Improvement', icon: Brain },
          { label: 'Finance', icon: PiggyBank },
          { label: 'Science', icon: FlaskConical },
          { label: 'Education', icon: GraduationCap },
        ].map(({ label, icon: Icon }) => (
          <div key={label} className="rounded-xl border p-3 flex items-center gap-2 bg-white">
            <Icon className="size-5 text-primary" />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Failed to load</p>}

      <h3 className="text-lg font-semibold">Recommendation</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {data?.items?.map(b => (
          <Card key={b.id}>
            <CardContent className="p-3">
              <img src={b.coverUrl ?? "/placeholder.svg"} alt={b.title} className="w-full h-44 object-cover rounded-md mb-2" />
              <div className="font-medium truncate" title={b.title}>{b.title}</div>
              <div className="text-sm text-muted-foreground truncate">{b.author.name}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">⭐ {b.rating.toFixed(1)}</span>
                <Link to={`/books/${b.id}`}><Button size="sm" variant="outline">Detail</Button></Link>
              </div>
            </CardContent>
          </Card>
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
              <div className="mx-auto size-10 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold">
                {name.split(' ').map(p=>p[0]).slice(0,2).join('')}
              </div>
              <div className="mt-2 text-sm font-medium truncate">{name}</div>
              <div className="text-xs text-muted-foreground">5 books</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
