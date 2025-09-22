import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { getUserReviews } from "@/services/reviews";

// Types
interface Review {
  id: number;
  bookId: number;
  userId: number;
  star: number;
  comment: string;
  createdAt: string;
  book: {
    id: number;
    title: string;
    author: string;
    category: string;
    coverImage: string;
  };
}

interface ReviewsResponse {
  success: boolean;
  message: string;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}



export function ReviewsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage] = useState(1);
  
  // Fetch reviews
  const { data, isLoading, error } = useQuery<ReviewsResponse>({
    queryKey: ["reviews", currentPage],
    queryFn: () => getUserReviews(currentPage)
  });
  
  // Filter reviews based on search term
  const filteredReviews = data?.data?.reviews?.filter((review: Review) => 
    review.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={i < rating ? "text-yellow-400" : "text-gray-300"}
          >
            <path 
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              fill="currentColor"
            />
          </svg>
        ))}
      </div>
    );
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reviews</h1>
      
      <div className="relative">
        <Input
          type="text"
          placeholder="Search Reviews"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
        <svg 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load reviews</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReviews.map((review: Review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <img 
                  src={review.book.coverImage || "/avatarfall.png"} 
                  alt={review.book.title}
                  className="w-20 h-28 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">
                    {formatDate(review.createdAt)}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    Category
                  </div>
                  <div className="font-medium mb-1">
                    {review.book.title}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {review.book.author}
                  </div>
                  {renderStars(review.star)}
                  <p className="mt-2 text-sm text-gray-700">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Footer with logo */}
      <div className="mt-12">
        <div className="text-center mb-4">
          <div className="inline-flex items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
            <span className="ml-2 font-semibold">Booky</span>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500">
          Discover inspiring stories & timeless knowledge, ready to become anyone. Explore online or visit our nearest library branch.
        </p>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 mb-2">Follow on Social Media</p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-gray-600">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.5 2H16.5C19.5376 2 22 4.46243 22 7.5V16.5C22 19.5376 19.5376 22 16.5 22H7.5C4.46243 22 2 19.5376 2 16.5V7.5C2 4.46243 4.46243 2 7.5 2Z"></path>
                <path d="M17 6.5C17.8284 6.5 18.5 7.17157 18.5 8C18.5 8.82843 17.8284 9.5 17 9.5C16.1716 9.5 15.5 8.82843 15.5 8C15.5 7.17157 16.1716 6.5 17 6.5Z" fill="white"></path>
                <path d="M12 8.5C14.4853 8.5 16.5 10.5147 16.5 13C16.5 15.4853 14.4853 17.5 12 17.5C9.51472 17.5 7.5 15.4853 7.5 13C7.5 10.5147 9.51472 8.5 12 8.5Z" fill="white"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.5 8C7.32843 8 8 7.32843 8 6.5C8 5.67157 7.32843 5 6.5 5C5.67157 5 5 5.67157 5 6.5C5 7.32843 5.67157 8 6.5 8Z"></path>
                <path d="M5 10C5 9.44772 5.44772 9 6 9H7C7.55228 9 8 9.44771 8 10V18C8 18.5523 7.55228 19 7 19H6C5.44772 19 5 18.5523 5 18V10Z"></path>
                <path d="M11 19H12C12.5523 19 13 18.5523 13 18V13.5C13 12 16 11 16 13V18C16 18.5523 16.4477 19 17 19H18C18.5523 19 19 18.5523 19 18V12C19 10 17.5 9 15.5 9C13.5 9 13 10.5 13 10.5V10C13 9.44771 12.5523 9 12 9H11C10.4477 9 10 9.44772 10 10V18C10 18.5523 10.4477 19 11 19Z"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.4592 5.92749C21.6896 6.24175 20.8624 6.45935 19.9968 6.56287C20.8803 6.02545 21.5609 5.1929 21.8824 4.20749C21.0537 4.69189 20.1393 5.03462 19.1752 5.21349C18.3991 4.38823 17.2787 3.875 16.0392 3.875C13.6534 3.875 11.7164 5.81206 11.7164 8.19706C11.7164 8.51387 11.7524 8.82238 11.8212 9.11937C8.25465 8.95062 5.08738 7.22893 2.96328 4.60831C2.61501 5.20775 2.41928 5.89484 2.41928 6.62393C2.41928 7.99854 3.17376 9.20575 4.32633 9.91819C3.62472 9.89731 2.96328 9.71844 2.38184 9.41887V9.47018C2.38184 11.5517 3.88506 13.2942 5.87378 13.6693C5.53458 13.7624 5.17719 13.8138 4.80695 13.8138C4.54658 13.8138 4.29528 13.7887 4.04835 13.7447C4.56145 15.4622 6.15506 16.7138 8.04506 16.7451C6.56506 17.9106 4.70695 18.5981 2.69506 18.5981C2.36835 18.5981 2.04601 18.5793 1.72803 18.5418C3.63999 19.7699 5.90158 20.4824 8.32385 20.4824C16.0287 20.4824 20.2599 13.8783 20.2599 8.15744C20.2599 7.98231 20.2568 7.80719 20.2506 7.63381C21.0886 7.02175 21.8855 6.25769 22.5 5.38575C21.6521 5.71246 20.7448 5.92749 19.7932 6.02545C20.7699 5.46581 21.5421 4.58456 21.9093 3.52206C21.0001 4.04425 19.993 4.42358 18.9213 4.63237C18.4277 4.12206 17.8209 3.71829 17.1453 3.45581C16.4697 3.19334 15.7413 3.07963 15.0152 3.12206C14.2892 3.16449 13.5793 3.36183 12.9445 3.69903C12.3097 4.03623 11.7671 4.50456 11.3581 5.06975C10.9492 5.63494 10.6846 6.28279 10.5854 6.96435C10.4862 7.64591 10.5548 8.34044 10.7858 8.99175C9.2168 8.91425 7.68525 8.49813 6.29032 7.77037C4.89539 7.04261 3.67552 6.02053 2.71506 4.77456C2.24749 5.59167 2.10692 6.54519 2.32506 7.45206C2.5432 8.35894 3.10506 9.15269 3.89506 9.67456C3.29749 9.65519 2.71501 9.49519 2.19506 9.20894V9.25894C2.19506 10.0368 2.47479 10.7905 2.9855 11.3968C3.49621 12.0031 4.20545 12.4264 5.00006 12.5964C4.44966 12.7447 3.87144 12.7681 3.31006 12.6651C3.53674 13.3289 3.97166 13.9061 4.55709 14.3155C5.14253 14.7249 5.84753 14.9459 6.57506 14.9464C5.31514 15.9436 3.74865 16.4814 2.13506 16.4776C1.82349 16.4776 1.51193 16.4589 1.20001 16.4214C2.84238 17.4814 4.77519 18.0401 6.75006 18.0339C13.5751 18.0339 17.3251 12.4651 17.3251 7.62894L17.3101 7.10894C18.1426 6.50894 18.8751 5.75894 19.4751 4.89894C18.6426 5.27394 17.7501 5.52894 16.8251 5.65394C17.7751 5.05394 18.5001 4.12894 18.8501 3.02894C17.9501 3.56894 16.9501 3.96894 15.9001 4.18894C15.0501 3.26894 13.8501 2.70894 12.5251 2.70894C10.0001 2.70894 7.95006 4.75894 7.95006 7.28394C7.95006 7.63394 7.98756 7.97394 8.05006 8.30394C4.20006 8.11394 0.750061 6.28894 -1.49994 3.52894C-1.87494 4.18894 -2.09994 4.95894 -2.09994 5.76894C-2.09994 7.31894 -1.29994 8.68894 -0.0499391 9.48894C-0.799939 9.46894 -1.49994 9.26894 -2.12494 8.93894V8.98894C-2.12494 11.2389 -0.574939 13.1389 1.52506 13.5639C1.90006 13.6639 2.30006 13.7139 2.70006 13.7139C2.40006 13.7139 2.10006 13.6889 1.82506 13.6389C2.37506 15.4889 4.05006 16.8389 6.07506 16.8889C4.52506 18.1389 2.55006 18.8889 0.400061 18.8889C0.0500607 18.8889 -0.299939 18.8639 -0.649939 18.8389C1.40006 20.1389 3.82506 20.9139 6.42506 20.9139C14.4251 20.9139 18.8501 14.2639 18.8501 8.46894C18.8501 8.28894 18.8501 8.10894 18.8501 7.92894C19.7501 7.26894 20.5501 6.45894 21.2001 5.52894C20.3001 5.88894 19.3501 6.12894 18.3501 6.23894C19.3751 5.63894 20.1751 4.68894 20.5751 3.53894C19.6251 4.10894 18.5751 4.51894 17.4501 4.74894C16.5251 3.80894 15.2001 3.22894 13.7501 3.22894C10.9751 3.22894 8.72506 5.47894 8.72506 8.25894C8.72506 8.63894 8.77506 9.00894 8.85006 9.36894C4.70006 9.15894 0.975061 7.15894 -1.49994 4.10894C-1.92494 4.83894 -2.17494 5.68894 -2.17494 6.58894C-2.17494 8.30894 -1.27494 9.83894 0.0750607 10.7389C-0.774939 10.7139 -1.57494 10.4889 -2.27494 10.1139V10.1639C-2.27494 12.6639 -0.524939 14.7639 1.80006 15.2389C2.17506 15.3389 2.57506 15.3889 2.97506 15.3889C2.67506 15.3889 2.37506 15.3639 2.07506 15.3139C2.67506 17.3639 4.57506 18.8639 6.85006 18.9139C5.10006 20.3139 2.90006 21.1389 0.525061 21.1389C0.150061 21.1389 -0.224939 21.1139 -0.599939 21.0889C1.70006 22.5389 4.42506 23.3889 7.35006 23.3889C16.1751 23.3889 21.0001 16.1139 21.0001 9.86894L20.9751 9.31894C21.9001 8.58894 22.7251 7.68894 23.4001 6.66894C22.4751 7.06894 21.4751 7.33894 20.4251 7.46894C21.5001 6.78894 22.3251 5.73894 22.7501 4.48894C21.7501 5.10894 20.6501 5.56894 19.4751 5.81894C18.5251 4.78894 17.1751 4.13894 15.6751 4.13894C12.7751 4.13894 10.4251 6.48894 10.4251 9.38894C10.4251 9.78894 10.4751 10.1889 10.5501 10.5639C6.15006 10.3389 2.17506 8.21394 -0.474939 4.93894C-0.924939 5.71394 -1.19994 6.61394 -1.19994 7.56394C-1.19994 9.38894 -0.249939 11.0139 1.17506 11.9639C0.300061 11.9389 -0.524939 11.7139 -1.27494 11.3139V11.3639C-1.27494 13.9889 0.575061 16.1889 3.02506 16.6889C3.40006 16.7889 3.80006 16.8389 4.22506 16.8389C3.90006 16.8389 3.57506 16.8139 3.27506 16.7639C3.90006 18.9139 5.92506 20.4889 8.32506 20.5389C6.47506 22.0139 4.15006 22.8889 1.65006 22.8889C1.27506 22.8889 0.900061 22.8639 0.525061 22.8389C2.95006 24.3889 5.80006 25.2889 8.85006 25.2889C17.3751 25.2889 22.0501 18.3889 22.0501 12.4139C22.0501 12.2389 22.0501 12.0639 22.0501 11.8889C23.0001 11.1639 23.8501 10.2889 24.5501 9.28894C23.6001 9.66394 22.5751 9.91394 21.5001 10.0389C22.6001 9.38894 23.4501 8.38894 23.8751 7.18894C22.8751 7.78894 21.7751 8.21394 20.6001 8.46394C19.6501 7.46394 18.3001 6.83894 16.8001 6.83894C13.9001 6.83894 11.5501 9.18894 11.5501 12.0889C11.5501 12.4889 11.6001 12.8889 11.6751 13.2639C7.27506 13.0389 3.30006 10.9139 0.650061 7.63894C0.200061 8.41394 -0.0749391 9.31394 -0.0749391 10.2639C-0.0749391 12.0889 0.875061 13.7139 2.30006 14.6639C1.42506 14.6389 0.600061 14.4139 -0.149939 14.0139V14.0639C-0.149939 16.6889 1.70006 18.8889 4.15006 19.3889C4.52506 19.4889 4.92506 19.5389 5.35006 19.5389C5.02506 19.5389 4.70006 19.5139 4.40006 19.4639C5.02506 21.6139 7.05006 23.1889 9.45006 23.2389C7.60006 24.7139 5.27506 25.5889 2.77506 25.5889C2.40006 25.5889 2.02506 25.5639 1.65006 25.5389C4.07506 27.0889 6.92506 27.9889 9.97506 27.9889C18.5001 27.9889 23.1751 21.0889 23.1751 15.1139L23.1501 14.5139C24.1001 13.7889 24.9501 12.9139 25.6501 11.9139C24.7001 12.2889 23.6751 12.5389 22.6001 12.6639C23.7001 12.0139 24.5501 11.0139 24.9751 9.81394"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}