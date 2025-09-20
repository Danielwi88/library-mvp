import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function Success() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { returnDate?: string } };
  const returnDate = state?.returnDate || dayjs().add(7, "day").format("D MMMM YYYY");
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
        </svg>
      </div>
      
      <h1 className="text-2xl font-semibold text-center mb-2">Borrowing Successful!</h1>
      
      <p className="text-center text-muted-foreground mb-8">
        Your book has been successfully borrowed. Please return it by <span className="text-destructive font-medium">{returnDate}</span>
      </p>
      
      <Button 
        className="w-full max-w-xs" 
        onClick={() => navigate("/me/loans")}
      >
        See Borrowed List
      </Button>
    </div>
  );
}