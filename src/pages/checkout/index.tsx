import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkout } from "@/services/loans";
import { clear } from "@/features/cart/cartSlice";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { getErrorMessage } from "@/lib/errors";

export default function Checkout() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const { state } = useLocation() as { state?: { selectedIds?: string[] } };
  const items = useSelector((s: RootState) => s.cart.items).filter(i => !state?.selectedIds || state.selectedIds.includes(i.bookId));
  const user = useSelector((s: RootState) => s.auth.user)!;

  const [days, setDays] = useState<3|5|10>(3);
  const [agreeA, setAgreeA] = useState(false);
  const [agreeB, setAgreeB] = useState(false);

  const borrowDate = dayjs();
  const returnDate = useMemo(() => borrowDate.add(days, "day"), [borrowDate, days]);

  const m = useMutation({
    mutationFn: () => checkout({ items: items.map(i => ({ bookId: i.bookId, qty: i.qty })) }),
    onMutate: () => { dispatch(clear()); },
    onSuccess: () => {
      toast.success("Borrow request submitted");
      qc.invalidateQueries({ queryKey: ["loans"] });
      nav("/me/loans");
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e) ?? "Checkout failed");
    }
  });

  return (
    <div className="grid md:grid-cols-[1fr,360px] gap-6">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Checkout</h1>

        <section className="ds-card p-4">
          <div className="font-medium mb-2">User Information</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div><div className="text-muted-foreground">Name</div><div>{user.name}</div></div>
            <div><div className="text-muted-foreground">Email</div><div>{user.email}</div></div>
            <div><div className="text-muted-foreground">Phone</div><div>{user.phone ?? "-"}</div></div>
          </div>
        </section>

        <section className="ds-card p-4">
          <div className="font-medium mb-2">Book List</div>
          <ul className="space-y-2">
            {items.map(i => (
              <li key={i.bookId} className="flex items-center gap-3">
                <img src={i.coverUrl ?? "/placeholder.svg"} className="w-12 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{i.title}</div>
                  <div className="text-sm text-muted-foreground">Qty: {i.qty}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="ds-card p-4 h-fit">
        <div className="font-medium mb-3">Complete Your Borrow Request</div>
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Borrow Date</div>
            <div className="border rounded-md px-3 py-2">{borrowDate.format("D MMM YYYY")}</div>
          </div>

          <div>
            <div className="text-muted-foreground mb-1">Borrow Duration</div>
            <div className="space-y-2">
              {[3,5,10].map(d => (
                <label key={d} className="flex items-center gap-2">
                  <input type="radio" name="days" checked={days===d} onChange={()=>setDays(d as 3|5|10)} />
                  {d} Days
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground mb-1">Return Date</div>
            <div className="border rounded-md px-3 py-2">
              Please return the book(s) no later than <span className="text-destructive font-medium">{returnDate.format("D MMM YYYY")}</span>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={agreeA} onChange={e=>setAgreeA(e.target.checked)} />
            I agree to return the book(s) before the due date.
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={agreeB} onChange={e=>setAgreeB(e.target.checked)} />
            I accept the library borrowing policy.
          </label>

          <Button className="w-full" disabled={!agreeA || !agreeB || items.length===0 || m.isPending} onClick={()=>m.mutate()}>
            Confirm & Borrow
          </Button>
        </div>
      </aside>
    </div>
  );
}
