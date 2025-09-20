import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import BookList from "@/pages/books/list";
import CategoriesPage from "@/pages/categories";
import BookDetail from "@/pages/books/detail";
import Loans from "@/pages/users/loans";
import Profile from "@/pages/users/profile";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";
import { RequireAuth } from "./guards";
import { Nav } from "@/components/nav";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import AdminAddBook from "@/pages/admin/add-book";
import Footer from "@/components/footer";
import AuthorBooksPage from "@/pages/authors/[authorId]";
import Success from "@/pages/success";


export function Router() {
  return (
    <BrowserRouter>
      <div className="min-h-dvh flex flex-col">
        <Nav />
        <div className="container mx-auto max-w-6xl px-3 py-4 flex-1">
          <Routes>
            <Route path="/" element={<BookList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/me/loans" element={<RequireAuth><Loans /></RequireAuth>} />
            <Route path="/me/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
            <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
            <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
            <Route path="/admin/add-book" element={<RequireAuth role="admin"><AdminAddBook/></RequireAuth>} />
            <Route path="/authors/:authorId" element={<AuthorBooksPage />} />
            <Route path="/success" element={<RequireAuth><Success /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
