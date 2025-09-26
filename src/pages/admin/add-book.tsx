import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createAuthor } from "@/services/authors";
import { adminCreateBook } from "@/services/books";
import { useState } from "react";

import { getErrorMessage } from "@/lib/errors";
import { ArrowLeft, Plus, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminAddBook() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publishedYear, setPublishedYear] = useState<number | ''>('');
  const [pages, setPages] = useState<number | ''>('');
  const [authorId, setAuthorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [totalCopies, setTotalCopies] = useState<number | ''>(1);
  const [, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Author modal state
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [authorErrors, setAuthorErrors] = useState<Record<string, string>>({});

  const categories = [
    { id: 1, name: "Science" },
    { id: 3, name: "Finance" },
    { id: 4, name: "Self-Improvement" },
    { id: 9, name: "Fiction" },
    { id: 11, name: "Non-Fiction" },
    { id: 14, name: "Education" }
  ];
  const nav = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Text is required";
    if (!description.trim()) newErrors.description = "Text is required";
    if (!isbn.trim()) newErrors.isbn = "ISBN is required";
    if (!publishedYear) newErrors.publishedYear = "Published year is required";
    if (!pages) newErrors.pages = "Text is required";
    if (!authorId) newErrors.authorId = "Text is required";
    if (!categoryId) newErrors.categoryId = "Text is required";
    if (!totalCopies) newErrors.totalCopies = "Total copies is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
    
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      const compressedImage = await compressImage(selectedFile);
      setImagePreview(compressedImage);
    } else {
      setImagePreview(null);
    }
  };

  const validateAuthor = () => {
    const newErrors: Record<string, string> = {};
    if (!authorName.trim()) newErrors.name = "Author name is required";
    if (!authorBio.trim()) newErrors.bio = "Author bio is required";
    setAuthorErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const createNewAuthor = async () => {
    if (!validateAuthor()) return;
    
    try {
      const author = await createAuthor({ name: authorName, bio: authorBio });
      setAuthorId(String(author.id));
      setAuthorModalOpen(false);
      setAuthorName("");
      setAuthorBio("");
      setAuthorErrors({});
      toast.success(`Author "${author.name}" created successfully`);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) ?? "Failed to create author");
    }
  };

  const save = async () => {
    if (!validate()) return;
    
    try {
      const payload = {
        title,
        description,
        isbn,
        publishedYear: Number(publishedYear),
        coverImage: imagePreview || "",
        authorId: Number(authorId),
        categoryId: Number(categoryId),
        totalCopies: Number(totalCopies),
        availableCopies: Number(totalCopies)
      };
      
      await adminCreateBook(payload);
      toast.success("Book created successfully");
      nav("/admin");
    } catch (e: unknown) {
      const errorMsg = getErrorMessage(e);
      if (errorMsg?.includes('401')) {
        toast.error("Unauthorized - Please login again");
      } else if (errorMsg?.includes('403')) {
        toast.error("Forbidden - You don't have permission");
      } else {
        toast.error(errorMsg ?? "Failed to create book");
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => nav("/admin")} className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-xl font-semibold">Add Book</h1>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <Input 
            placeholder="Enter book title"
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className={`h-12 ${errors.title ? "border-red-500" : ""}`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
          <div className="flex gap-2">
            <Input 
              type="number"
              placeholder="Enter author ID"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className={`h-12 flex-1 ${errors.authorId ? "border-red-500" : ""}`}
            />
            <Dialog open={authorModalOpen} onOpenChange={setAuthorModalOpen}>
              <TooltipProvider>
                <Tooltip>
                  <DialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="outline" className="h-12 px-3 ">
                        <Plus className="size-4" />
                      </Button>
                    </TooltipTrigger>
                  </DialogTrigger>
                  <TooltipContent side="top">Register new author here</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Author</DialogTitle>
                </DialogHeader>
                <DialogDescription className="sr-only">
                  Provide the author details to add them to the library.
                </DialogDescription>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <Input 
                      placeholder="Enter author name"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className={authorErrors.name ? "border-red-500" : ""}
                    />
                    {authorErrors.name && <p className="text-red-500 text-xs mt-1">{authorErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio (Detailed)</label>
                    <Textarea 
                      placeholder="Enter detailed author biography, background, achievements, and notable works..."
                      value={authorBio}
                      onChange={(e) => setAuthorBio(e.target.value)}
                      className={`min-h-32 ${authorErrors.bio ? "border-red-500" : ""}`}
                    />
                    {authorErrors.bio && <p className="text-red-500 text-xs mt-1">{authorErrors.bio}</p>}
                  </div>
                  <Button onClick={createNewAuthor} className="w-full">
                    Create Author
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {errors.authorId && <p className="text-red-500 text-xs mt-1">{errors.authorId}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select 
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`h-12 w-full px-3 border rounded-md bg-white ${errors.categoryId ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
          <Input 
            placeholder="Enter ISBN"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            className={`h-12 ${errors.isbn ? "border-red-500" : ""}`}
          />
          {errors.isbn && <p className="text-red-500 text-xs mt-1">{errors.isbn}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Published Year</label>
          <Input 
            type="number"
            placeholder="Enter published year"
            value={publishedYear}
            onChange={(e) => setPublishedYear(e.target.value ? Number(e.target.value) : '')}
            className={`h-12 ${errors.publishedYear ? "border-red-500" : ""}`}
          />
          {errors.publishedYear && <p className="text-red-500 text-xs mt-1">{errors.publishedYear}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Pages</label>
          <Input 
            type="number" 
            placeholder="Enter number of pages"
            value={pages} 
            onChange={(e) => setPages(e.target.value ? Number(e.target.value) : '')}
            className={`h-12 ${errors.pages ? "border-red-500" : ""}`}
          />
          {errors.pages && <p className="text-red-500 text-xs mt-1">{errors.pages}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <Textarea 
            placeholder="Enter book description"
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            className={`min-h-24 resize-none ${errors.description ? "border-red-500" : ""}`}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors sm:w-[529px] mx-auto">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="mx-auto mb-4 rounded-lg border object-cover"
                  style={{ width: 92, height: 138 }}
                />
                <div className="flex gap-2 justify-center mb-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="flex-1 sm:flex-none"
                  >
                    <Upload className="size-4 mr-2" />
                    Change Image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setImagePreview(null);
                    }}
                    className="text-red-600 flex-1 sm:flex-none"
                  >
                    <X className="size-4 mr-2" />
                    Delete Image
                  </Button>
                </div>
                <p className="text-xs text-gray-500">PNG or JPG (max. 5mb)</p>
              </>
            ) : (
              <>
                <Upload className="mx-auto size-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG or JPG (max. 5mb)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            )}
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Copies</label>
          <Input 
            type="number"
            min={1}
            placeholder="Enter total copies"
            value={totalCopies}
            onChange={(e) => setTotalCopies(e.target.value ? Number(e.target.value) : '')}
            className={`h-12 ${errors.totalCopies ? "border-red-500" : ""}`}
          />
          {errors.totalCopies && <p className="text-red-500 text-xs mt-1">{errors.totalCopies}</p>}
        </div>
        
        <Button onClick={save} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
          Save
        </Button>
      </div>
    </div>
  );
}
