import { useQuery } from "@tanstack/react-query";
import { getAdminOverview } from "@/services/admin";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {

  return (
    <div className="space-y-4">
      <div className="flex gap-2"><Button>Overview</Button></div>
      <OverviewTab/>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border p-4 bg-white">
      <div className="text-[12px] text-neutral-600">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function OverviewTab() {
  const q = useQuery({ queryKey: ["admin-overview"], queryFn: getAdminOverview });
  if (q.isLoading) return <p>Loading...</p>;
  if (!q.data) return <p className="text-red-500">Failed to load</p>;
  const d = q.data;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={d.totals.users} />
        <StatCard label="Total Books" value={d.totals.books} />
        <StatCard label="Active Loans" value={d.loans.active} />
        <StatCard label="Overdue Loans" value={d.loans.overdue} />
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Top Borrowed</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {d.topBorrowed.map((b, i) => (
            <ProductCard
              key={b.id}
              id={b.id}
              title={b.title}
              authorName={b.author?.name ?? "Unknown"}
              rating={b.rating}
              coverUrl={b.coverUrl}
              index={i}
              compact
            />
          ))}
        </div>
        {d.generatedAt && (
          <div className="text-xs text-muted-foreground">Updated at {new Date(d.generatedAt).toLocaleString()}</div>
        )}
      </div>
    </div>
  );
}

// Other tabs removed to avoid calling unavailable endpoints; Overview provides the main metrics.
