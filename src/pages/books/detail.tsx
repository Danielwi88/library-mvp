import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBook } from "@/services/books";
import { getReviews, upsertReview, type Review } from "@/services/reviews";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { add } from "@/features/cart/cartSlice";
import { ReviewCard } from "@/components/review-card";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function BookDetail() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const dispatch = useDispatch();

  const bookQ = useQuery({ queryKey: ["book", id], queryFn: () => fetchBook(id) });
  const reviewsQ = useQuery({ queryKey: ["reviews", id], queryFn: () => getReviews(id) });

  const reviewMutation = useMutation({
    mutationFn: (v: { rating: number; comment?: string }) => upsertReview(id, v),
    // Optimistic: update list immediately
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ["reviews", id] });
      const previous = qc.getQueryData<Review[]>(["reviews", id]);
      const me: Review = { id: "optimistic", bookId: id, user: { id: "me", name: "You" }, rating: v.rating, comment: v.comment, createdAt: new Date().toISOString() };
      qc.setQueryData(["reviews", id], [me, ...(previous ?? [])]);
      return { previous };
    },
    onError: (_err, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(["reviews", id], ctx.previous);
      toast.error("Failed to submit review");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", id] });
      toast.success("Review submitted");
    }
  });

  const { register, handleSubmit, reset } = useForm<{ rating: number; comment?: string }>({ defaultValues: { rating: 5 } });

  if (bookQ.isLoading) return <p>Loading...</p>;
  if (!bookQ.data) return <p>Not found</p>;
  const b = bookQ.data;

  return (
    <div className="grid gap-6 md:grid-cols-[280px,1fr]">
      <img src={b.coverUrl ?? "/placeholder.svg"} className="rounded-lg w-full object-cover" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{b.title}</h1>
        <div className="text-muted-foreground">{b.author.name}</div>
        <div className="text-sm">⭐ {b.rating.toFixed(1)} · Stock: {b.stock}</div>
        <p className="mt-2 text-sm">{b.description}</p>
        <div className="flex gap-2 mt-3">
          <Button onClick={() => dispatch(add({ bookId: b.id, title: b.title, coverUrl: b.coverUrl }))}>Add to Cart</Button>
        </div>

        <hr className="my-4" />
        <h2 className="font-semibold">Write a review</h2>
        <form className="flex items-center gap-2" onSubmit={handleSubmit((v) => { reviewMutation.mutate(v); reset({ rating: 5, comment: "" }); })}>
          <Input type="number" min={1} max={5} step={1} className="w-24" {...register("rating", { valueAsNumber: true })} />
          <Input placeholder="Your thoughts..." {...register("comment")} />
          <Button type="submit" disabled={reviewMutation.isPending}>Send</Button>
        </form>

        <h2 className="mt-4 font-semibold">Reviews</h2>
        <div>
          {reviewsQ.data?.map(r => (
            <ReviewCard key={r.id} name={r.user.name} rating={r.rating} comment={r.comment} createdAt={r.createdAt} />
          ))}
        </div>
      </div>
    </div>
  );
}
