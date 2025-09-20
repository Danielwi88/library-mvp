import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { remove } from "@/features/cart/cartSlice";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CoverImage from "@/components/cover-image";

type Sel = Record<string, boolean>;

export default function Cart() {
  const items = useSelector((s: RootState) => s.cart.items);
  const [sel, setSel] = useState<Sel>(() => Object.fromEntries(items.map(i => [i.bookId, true])));
  const allChecked = useMemo(() => items.length > 0 && items.every(i => sel[i.bookId]), [items, sel]);
  const count = useMemo(() => items.filter(i => sel[i.bookId]).length, [items, sel]);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const toggleAll = () => {
    const next = !allChecked;
    setSel(Object.fromEntries(items.map(i => [i.bookId, next])));
  };

  const toggle = (id: string) => setSel(s => ({ ...s, [id]: !s[id] }));

  const proceed = () => {
    if (count === 0) return;
    nav("/checkout", { state: { selectedIds: items.filter(i => sel[i.bookId]).map(i => i.bookId) } });
  };

  return (
    <div className="grid md:grid-cols-[1fr,320px] gap-6">
      <div>
        <h1 className="text-xl font-semibold mb-2">My Cart</h1>
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" checked={allChecked} onChange={toggleAll} />
          <span className="text-sm text-muted-foreground">Select All</span>
        </div>

        <ul className="space-y-3">
          {items.map(i => (
            <li key={i.bookId} className="ds-card p-3 flex gap-3 items-center">
              <input type="checkbox" checked={!!sel[i.bookId]} onChange={() => toggle(i.bookId)} />
              <CoverImage src={i.coverUrl} alt={i.title} className="w-12 h-16 object-cover rounded" index={0} />
              <div className="flex-1">
                <div className="font-medium">{i.title}</div>
                <div className="text-sm text-muted-foreground">Qty: {i.qty}</div>
              </div>
              <Button variant="ghost" onClick={() => dispatch(remove(i.bookId))}>Remove</Button>
            </li>
          ))}
          {items.length === 0 && <p className="text-muted-foreground">Your cart is empty.</p>}
        </ul>
      </div>

      {/* Summary card (right on desktop, bottom sticky on mobile) */}
      <div className="hidden md:block">
        <Summary count={count} onBorrow={proceed} />
      </div>
      <div className="md:hidden fixed bottom-3 left-0 right-0 px-3">
        <div className="mx-auto max-w-6xl">
          <Summary count={count} onBorrow={proceed} />
        </div>
      </div>
    </div>
  );
}

function Summary({ count, onBorrow }: { count: number; onBorrow: () => void; }) {
  return (
    <div className="ds-card p-4">
      <div className="font-medium mb-1">Loan Summary</div>
      <div className="text-sm text-muted-foreground mb-3">Total Book<span className="float-right text-foreground">{count} item(s)</span></div>
      <Button className="w-full" disabled={count === 0} onClick={onBorrow}>Borrow Book</Button>
    </div>
  );
}
