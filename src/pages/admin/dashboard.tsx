import { useQuery } from "@tanstack/react-query";
import { adminLoans } from "@/services/loans";
import { adminUsers } from "@/services/users";
import { adminCreateBook, fetchBooks } from "@/services/books";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export default function AdminDashboard() {
  const [tab, setTab] = useState<"borrowers"|"users"|"books">("borrowers");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={tab==="borrowers"?"default":"outline"} onClick={()=>setTab("borrowers")}>Borrowed List</Button>
        <Button variant={tab==="users"?"default":"outline"} onClick={()=>setTab("users")}>User List</Button>
        <Button variant={tab==="books"?"default":"outline"} onClick={()=>setTab("books")}>Book List</Button>
      </div>
      {tab==="borrowers" && <BorrowersTab/>}
      {tab==="users" && <UsersTab/>}
      {tab==="books" && <BooksTab/>}
    </div>
  );
}

function BorrowersTab() {
  const q = useQuery({ queryKey: ["admin-loans"], queryFn: () => adminLoans() });
  if (q.isLoading) return <p>Loading...</p>;
  return (
    <div className="space-y-2">
      {q.data?.map(l => (
        <div key={l.id} className="rounded-lg border p-3">
          <div className="font-medium">{l.book.title}</div>
          <div className="text-sm text-muted-foreground">Status: {l.status}</div>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const q = useQuery({ queryKey: ["admin-users"], queryFn: () => adminUsers() });
  if (q.isLoading) return <p>Loading...</p>;
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr><th className="p-2 text-left">Name</th><th className="p-2">Email</th><th className="p-2">Phone</th><th className="p-2">Role</th></tr>
        </thead>
        <tbody>
          {q.data?.items.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2 text-left">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.phone ?? "-"}</td>
              <td className="p-2">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BooksTab() {
  const list = useQuery({ queryKey: ["admin-books"], queryFn: () => fetchBooks({ page: 1, limit: 100 }) });
  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState("");

  const create = async () => {
    try {
      await adminCreateBook({ title, authorId });
      toast.success("Book added");
      setTitle(""); setAuthorId("");
      list.refetch();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) ?? "Failed to add");
    }
  };

  return (
    <div className="grid md:grid-cols-[320px,1fr] gap-4">
      <div className="rounded-lg border p-3 space-y-2">
        <div className="font-medium">Add Book</div>
        <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <Input placeholder="Author ID" value={authorId} onChange={e=>setAuthorId(e.target.value)} />
        <Button onClick={create}>Create</Button>
      </div>
      <div className="space-y-2">
        {list.data?.items.map(b => (
          <div key={b.id} className="rounded-lg border p-3 flex items-center gap-3">
            <img src={b.coverUrl ?? "/placeholder.svg"} className="w-12 h-16 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-muted-foreground">{b.author.name}</div>
            </div>
            <div className="text-sm">⭐ {b.rating.toFixed(1)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
