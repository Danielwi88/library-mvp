import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminCreateBook } from "@/services/books";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/lib/errors";

export default function AdminAddBook() {
  const [title,setTitle]=useState("");
  const [author,setAuthor]=useState("");
  const [categoryId,setCategoryId]=useState("");
  const [pages,setPages]=useState<number|''>('');
  const [description,setDescription]=useState("");
  const [file,setFile]=useState<File|null>(null);
  const nav = useNavigate();

  const save = async () => {
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("authorName", author);
      fd.append("categoryId", categoryId);
      if (pages) fd.append("pages", String(pages));
      fd.append("description", description);
      if (file) fd.append("cover", file);
      await adminCreateBook(fd);
      toast.success("Book saved");
      nav("/admin");
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) ?? "Failed to save");
    }
  };

  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-xl font-semibold">Add Book</h1>
      <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <Input placeholder="Author" value={author} onChange={e=>setAuthor(e.target.value)} />
      <Input placeholder="Category ID" value={categoryId} onChange={e=>setCategoryId(e.target.value)} />
      <Input placeholder="Number of Pages" type="number" value={pages} onChange={e=>setPages(e.target.value? Number(e.target.value):'')} />
      <textarea className="border rounded-md p-2 min-h-28" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
      <Button onClick={save}>Save</Button>
    </div>
  );
}
