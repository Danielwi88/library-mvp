import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitReview } from "@/services/reviews";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { type Loan } from "@/services/loans";

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
    onSuccess: (data) => {
      console.log('Review submitted successfully:', data);
      setOpen(false);
      setRating(0);
      setComment("");
      // Invalidate both loans and reviews queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error) => {
      console.error('Failed to submit review:', error);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-blue-600">Give Review</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Give Rating</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Share your thoughts about this book</label>
            <Textarea
              placeholder="Write your review here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-20"
            />
          </div>
          <Button 
            className="w-full" 
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