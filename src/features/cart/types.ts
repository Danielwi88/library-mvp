export interface CartItem {
  bookId: string;
  title: string;
  coverUrl?: string | null;
  qty: number;
}