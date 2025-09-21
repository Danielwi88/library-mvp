import Footer from "@/components/footer";
import { Nav } from "@/components/nav";
import AdminAddBook from "@/pages/admin/add-book";
import AdminDashboard from "@/pages/admin/dashboard";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import AuthorBooksPage from "@/pages/authors/[authorId]";
import BookDetail from "@/pages/books/detail";
import BookList from "@/pages/books/list";
import Cart from "@/pages/cart";
import CategoriesPage from "@/pages/categories";
import Checkout from "@/pages/checkout";
import NotFound from "@/pages/not-found";
import Success from "@/pages/success";
import Loans from "@/pages/users/loans";
import Profile from "@/pages/users/profile";

import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { RequireAuth } from "./guards";


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
            {/* User profile section */}
            <Route path="/me">
              <Route index element={<RequireAuth><Navigate to="/me/profile" replace /></RequireAuth>} />
              <Route path="loans" element={<RequireAuth><Loans /></RequireAuth>} />
              <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
            </Route>
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
