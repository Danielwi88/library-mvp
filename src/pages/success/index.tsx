import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function Success() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { returnDate?: string } };
  const returnDate = state?.returnDate || dayjs().add(7, "day").format("D MMMM YYYY");
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 mx-auto">
      <div className="mb-8">
        <svg
          className="w-28 h-28 sm:w-[142.38px] sm:h-[142.38px]"
          viewBox="0 0 142 142"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          {/* outer concentric rings */}
          <circle cx="71" cy="71" r="69" fill="none" stroke="#e9eaeb" strokeWidth="1" />
          <circle cx="71" cy="71" r="60" fill="none" stroke="#e9eaeb" strokeWidth="1" />
          <circle cx="71" cy="71" r="50" fill="none" stroke="#e9eaeb" strokeWidth="1" />
          {/* inner solid circle */}
          <circle cx="71" cy="71" r="36" fill="#1c65da" />
          {/* rounded check */}
          <path
            d="M56 71 L66.5 81.5 L87 61"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      <h1 className="text-xl sm:text-display-sm font-bold text-center mb-2">Borrowing Successful!</h1>
      
      <p className="text-center text-md sm:text-lg font-semibold  text-muted-foreground mb-8">
        Your book has been successfully borrowed. Please return it by <span className="text-accent-red text-md sm:text-lg font-semibold">{returnDate}</span>
      </p>
      
      <Button 
        className="w-full max-w-xs h-12 text-md font-bold rounded-full cursor-pointer hover:-translate-y-0.5 hover:shadow-sm " 
        onClick={() => navigate("/me/loans")}
      >
        See Borrowed List
      </Button>
    </div>
  );
}