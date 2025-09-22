import ProductCard from "@/components/product-card";
import { toggleCategory } from "@/features/ui/uiSlice";
import { fetchBooks } from "@/services/books";
import type { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";

const CATEGORY_FILTER_OPTIONS = [
  { id: 1, name: "Science" },
  { id: 3, name: "Finance" },
  { id: 4, name: "Self-Improvement" },
  { id: 9, name: "Fiction" },
  { id: 11, name: "Non-Fiction" },
  { id: 14, name: "Education" },
] as const;

const RATING_FILTER_OPTIONS = [5, 4, 3, 2, 1] as const;

interface FilterCheckboxProps<T = string | number> {
  checked: boolean;
  value: T;
  onChange: (value: T) => void;
  label: string;
}

const FilterCheckboxBase = <T extends string | number>({ checked, value, onChange, label }: FilterCheckboxProps<T>) => {
  const handleChange = useCallback(() => onChange(value), [onChange, value]);
  return (
    <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={handleChange} className="sr-only" />
      <span className={`h-4 w-4 border rounded-sm flex items-center justify-center ${
        checked ? 'bg-primary border-primary' : 'border-gray-400'
      }`}>
        {checked && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5L4 8L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {label}
    </label>
  );
};
const FilterCheckbox = React.memo(FilterCheckboxBase) as typeof FilterCheckboxBase;

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const selectedCategoryIds = useSelector((s: RootState) => s.ui.categoryIds);
  const [selectedRatingIds, setSelectedRatingIds] = useState<number[]>([]);

  const booksQ = useQuery({ queryKey: ['books', { page: 1 }], queryFn: () => fetchBooks({ page: 1, limit: 40 }) });

  const books = useMemo(() => booksQ.data?.items ?? [], [booksQ.data]);

  const filteredBooks = useMemo(() => {
    if (selectedCategoryIds.length === 0 && selectedRatingIds.length === 0) {
      return books;
    }

    return books.filter(book => {
      const categoryMatch = selectedCategoryIds.length === 0 || 
        book.categories?.some(cat => selectedCategoryIds.includes(String(cat.id)));
      
      const ratingMatch = selectedRatingIds.length === 0 || 
        selectedRatingIds.includes(Math.round(book.rating ?? 0));
      
      return categoryMatch && ratingMatch;
    });
  }, [books, selectedCategoryIds, selectedRatingIds]);

  const handleRatingToggle = useCallback((rating: number) => {
    setSelectedRatingIds(current => 
      current.includes(rating) 
        ? current.filter(r => r !== rating)
        : [...current, rating]
    );
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    dispatch(toggleCategory(categoryId));
  }, [dispatch]);

  return (
    <div className="grid md:grid-cols-[220px,1fr] gap-6">
      <aside className="ds-card p-4 h-fit">
        <div className="text-xs font-bold tracking-wider mb-4 uppercase">Filter</div>
        <div className="mb-6">
          <div className="text-sm font-medium mb-2">Category</div>
          <div className="space-y-3">
            {CATEGORY_FILTER_OPTIONS.map((category) => (
              <FilterCheckbox
                key={category.id}
                checked={selectedCategoryIds.includes(String(category.id))}
                value={String(category.id)}
                onChange={handleCategoryToggle}
                label={category.name}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Rating</div>
          <div className="space-y-3">
            {RATING_FILTER_OPTIONS.map(rating => (
              <FilterCheckbox
                key={rating}
                checked={selectedRatingIds.includes(rating)}
                value={rating}
                onChange={handleRatingToggle}
                label={`${rating}+`}
              />
            ))}
          </div>
        </div>
      </aside>

      <section className="space-y-4 pt-1 pl-1">
        <h1 className="text-lg font-semibold">Book List</h1>
        {booksQ.isLoading ? (
          <p>Loading books...</p>
        ) : booksQ.error ? (
          <p className="text-red-500">Failed to load books</p>
        ) : filteredBooks.length === 0 ? (
          <p className="text-gray-500">No books found matching your filters</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBooks.map((book, index) => (
              <ProductCard key={book.id} id={book.id} title={book.title} authorName={book.author.name} coverUrl={book.coverUrl} rating={book.rating} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
