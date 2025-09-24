import CoverImage from "@/components/cover-image";
import { Button } from "@/components/ui/button";
import { fetchBookDetail } from "@/services/books";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Share2 } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function AdminBookPreview() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["book-detail", id],
    queryFn: () => fetchBookDetail(id),
    enabled: Boolean(id)
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data) return <p className="text-red-500">Failed to load book preview.</p>;

  const { book } = data;
  const primaryCategory = book.categories?.[0]?.name ?? "Uncategorized";
  const rating = Number.isFinite(book.rating) ? Number(book.rating).toFixed(1) : "0.0";
  const totalCopies = book.totalCopies ?? 0;
  const reviewCount = book.reviewCount ?? 0;
  const borrowCount = book.borrowCount ?? 0;
  const publishedYear = book.publishedYear;
  const isbn = book.isbn;

  return (
    <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-0 space-y-6">
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <span className="hidden sm:block text-neutral-300">|</span>
        <Link to="/admin" className="hidden sm:block text-xs font-semibold text-primary-300 hover:underline">
          Admin Dashboard
        </Link>
      </div>

      <div className="rounded-3xl bg-white dark:bg-background pt-6 sm:pt-9 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
        <div className="flex flex-col md:flex-row gap-9 items-center md:items-start px-6 sm:px-10 pb-8">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <CoverImage
              src={book.coverUrl}
              alt={book.title}
              index={0}
              className="w-[212px] sm:w-[260px] md:w-[320px] aspect-[321/482] object-cover border-8 border-neutral-200"
            />
          </div>

          <div className="flex-1 space-y-5 md:space-y-6 text-start md:text-left">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700">
                {primaryCategory}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold text-neutral-950">
                {book.title}
              </h2>
              <p className="text-sm sm:text-base font-medium text-neutral-600">
                {book.author?.name ?? "Unknown Author"}
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <img src="/star.svg" alt="Rating" className="h-5 w-5" />
                {rating}
              </div>
            </div>

            <div className="grid w-full md:max-w-[70%] grid-cols-3 divide-x divide-neutral-200 border border-neutral-200 rounded-2xl bg-neutral-25">
              <StatCard label="Page" value={totalCopies} />
              <StatCard label="Rating" value={rating} />
              <StatCard label="Reviews" value={reviewCount} />
            </div>

            <div className="hidden md:block">
              <hr className="border-neutral-200 md:max-w-[70%]" />
            </div>

            <Section title="Description">
              <p className="text-sm sm:text-base font-medium leading-6 text-neutral-700 line-clamp-6">
                {book.description || "This book does not yet include a description."}
              </p>
            </Section>

            <Section title="Details" className="grid gap-2 text-sm sm:text-base text-neutral-700">
              <Detail label="ISBN" value={isbn ?? "N/A"} />
              <Detail label="Published" value={publishedYear ?? "N/A"} />
              <Detail label="Times Borrowed" value={borrowCount} />
              <Detail label="Available Copies" value={book.stock ?? 0} />
            </Section>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/books/${book.id}`)}
                className="rounded-full h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-md font-semibold border-neutral-300"
              >
                <ExternalLink className="mr-2 size-4" /> View Public Page
              </Button>
              <Button
                onClick={() => navigate(`/admin/book/${book.id}/edit`)}
                className="rounded-full h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-md font-semibold bg-primary-300 hover:bg-primary-400 text-neutral-50"
              >
                Edit Book
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-neutral-300 h-10 w-10"
              >
                <Share2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-4 py-3 text-left">
      <div className="text-lg sm:text-display-xs font-bold text-neutral-950">{value}</div>
      <div className="text-xs sm:text-sm font-medium text-neutral-600 mt-1 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      <h3 className="text-sm sm:text-lg font-bold text-neutral-900">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 text-sm sm:text-base font-medium">
      <span className="text-neutral-500 min-w-[120px]">{label}</span>
      <span className="text-neutral-900">{value}</span>
    </div>
  );
}
