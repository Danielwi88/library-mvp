import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { myLoans, checkout, type Loan } from "@/services/loans";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { clear } from "@/features/cart/cartSlice";
import { toast } from "sonner";
import { useState } from "react";
import CoverImage from "@/components/cover-image";
import { getErrorMessage } from "@/lib/errors";

export default function Loans() {
  const qc = useQueryClient();
  const cart = useSelector((s: RootState) => s.cart.items);
  const dispatch = useDispatch();
  const q = useQuery({ queryKey: ["loans"], queryFn: myLoans });
  
  // filters & search
  const [status, setStatus] = useState<"" | "BORROWED" | "RETURNED" | "OVERDUE">("");
  const [search, setSearch] = useState("");

  // client-side filter (can move to server later)
  const list = ((qData: Loan[] | undefined) => {
    let arr: Loan[] = qData ?? [];
    if (status) arr = arr.filter((l) => l.status === status);
    if (search) arr = arr.filter((l) => l.book.title.toLowerCase().includes(search.toLowerCase()));
    return arr;
  })(q.data);

  const checkoutM = useMutation({
    mutationFn: () => checkout({ items: cart.map(c => ({ bookId: c.bookId, qty: c.qty })) }),
    onMutate: async () => {
      dispatch(clear()); // optimistic: clear cart now
    },
    onSuccess: () => {
      toast.success("Checkout success");
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e) ?? "Checkout failed");
    }
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">My Borrowed List</h1>

      {cart.length > 0 && (
        <div className="flex items-center gap-2">
          <Button onClick={() => checkoutM.mutate()} disabled={checkoutM.isPending}>
            Checkout {cart.length} item(s)
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          className="h-10 px-3 py-2 border rounded-md"
          placeholder="Search book"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-1 text-sm">
          <button
            className={`ds-pill ${!status && "bg-primary text-primary-foreground"}`}
            onClick={() => setStatus("")}
          >
            All
          </button>
          <button
            className={`ds-pill ${status === "BORROWED" && "bg-primary text-primary-foreground"}`}
            onClick={() => setStatus("BORROWED")}
          >
            Active
          </button>
          <button
            className={`ds-pill ${status === "RETURNED" && "bg-primary text-primary-foreground"}`}
            onClick={() => setStatus("RETURNED")}
          >
            Returned
          </button>
          <button
            className={`ds-pill ${status === "OVERDUE" && "bg-primary text-primary-foreground"}`}
            onClick={() => setStatus("OVERDUE")}
          >
            Overdue
          </button>
        </div>
      </div>

      {q.isLoading && <p>Loading...</p>}
      {q.error && <p className="text-red-500">Failed to load</p>}

      <ul className="space-y-3">
        {list?.map((l) => (
          <li key={l.id} className="ds-card p-3 flex gap-3">
            <CoverImage src={l.book.coverUrl} alt={l.book.title} className="w-12 h-16 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{l.book.title}</div>
              <div className="text-sm text-muted-foreground">
                Status:{" "}
                <span
                  className={
                    l.status === "RETURNED"
                      ? "text-green-600"
                      : l.status === "OVERDUE"
                      ? "text-red-600"
                      : "text-primary"
                  }
                >
                  {l.status}
                </span>
                {" · "}Due: {dayjs(l.dueDate).format("D MMM YYYY")}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
