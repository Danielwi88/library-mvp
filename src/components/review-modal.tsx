import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitReview } from "@/services/reviews";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { type Loan } from "@/services/loans";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

interface ReviewModalProps {
  loan: Loan;
}

export function ReviewModal({ loan }: ReviewModalProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  
  const reviewMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      toast.success("Review posted successfully");
      setOpen(false);
      setRating(0);
      setComment("");
      // Invalidate both loans and reviews queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) ?? "Failed to post review");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-white rounded-full !bg-primary-300 w-full sm:w-[182px] h-10">Give Review</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[439px] w-full sm:w-[439px] ">
        <DialogHeader>
          <DialogTitle className="text-start sm:text-center text-neutral-950 dark:text-foreground text-lg sm:text-display-xs font-bold">Give Review</DialogTitle>
        </DialogHeader>
        <h2 className="text-center text-neutral-950 text-sm sm:text-md font-bold dark:text-foreground">Give Rating</h2>
        <div className="space-y-6">
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="size-10 sm:size-[49px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="34" viewBox="0 0 36 34" fill="none">
                  <path
                    d="M17.5829 28.2677L9.11003 33.3719C8.73573 33.6101 8.34441 33.7122 7.93607 33.6781C7.52774 33.6441 7.17045 33.508 6.8642 33.2698C6.55795 33.0316 6.31975 32.7342 6.14961 32.3776C5.97947 32.021 5.94545 31.6208 6.04753 31.1771L8.29336 21.5302L0.790239 15.0479C0.449961 14.7417 0.237627 14.3925 0.153239 14.0005C0.0688497 13.6085 0.0940301 13.2261 0.22878 12.8531C0.36353 12.4802 0.567697 12.1739 0.84128 11.9344C1.11486 11.6948 1.48917 11.5417 1.9642 11.475L11.8663 10.6073L15.6944 1.52188C15.8645 1.11354 16.1286 0.807291 16.4866 0.603125C16.8445 0.398958 17.21 0.296875 17.5829 0.296875C17.9559 0.296875 18.3214 0.398958 18.6793 0.603125C19.0373 0.807291 19.3014 1.11354 19.4715 1.52188L23.2996 10.6073L33.2017 11.475C33.6781 11.5431 34.0524 11.6962 34.3246 11.9344C34.5968 12.1726 34.801 12.4788 34.9371 12.8531C35.0732 13.2274 35.0991 13.6106 35.0147 14.0026C34.9303 14.3946 34.7173 14.743 34.3757 15.0479L26.8725 21.5302L29.1184 31.1771C29.2204 31.6194 29.1864 32.0196 29.0163 32.3776C28.8461 32.7356 28.6079 33.033 28.3017 33.2698C27.9954 33.5066 27.6382 33.6427 27.2298 33.6781C26.8215 33.7135 26.4302 33.6114 26.0559 33.3719L17.5829 28.2677Z"
                    fill={star <= rating ? "var(--Accent-Yellow, #FDB022)" : "#D1D5DB"}
                  />
                </svg>
              </button>
            ))}
          </div>
          <div>
            
            <Textarea
              placeholder="Please share your thoughts about this book"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-20 h-[235px] bg-white "
            />
          </div>
          <Button 
            className="w-full rounded-full text-neutral-25  h-10 sm:h-12 text-sm sm:text-md font-bold " 
            onClick={() => {
              if (rating > 0) {
                console.log('Submitting review:', { bookId: loan.bookId, rating: rating, comment });
                reviewMutation.mutate({
                  bookId: loan.bookId,
                  rating: rating,
                  comment: comment || ""
                });
              }
            }}
            disabled={rating === 0 || reviewMutation.isPending}
          >
            {reviewMutation.isPending ? 'Submitting...' : 'Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}