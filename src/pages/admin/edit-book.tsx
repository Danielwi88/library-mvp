import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBookDetail } from "@/services/books";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { api } from "@/services/api";
import { isAxiosError } from "axios";

interface BookDetail {
  title?: string;
  description?: string;
  isbn?: string;
  publishedYear?: number;
  authorId?: number | string;
  categoryId?: number | string;
  totalCopies?: number;
  coverUrl?: string | null;
  coverImage?: string | null;
  author?: { id: number | string; name?: string };
  categories?: { id: number | string; name?: string }[];
}

interface BookDetailResponse {
  book: BookDetail;
  reviews: unknown[];
}

interface UpdateBookPayload {
  title: string;
  description: string;
  isbn: string;
  publishedYear: number;
  coverImage: string;
  authorId: number;
  categoryId: number;
  totalCopies: number;
  availableCopies: number;
}

export default function EditBook() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publishedYear, setPublishedYear] = useState<number | ''>('');
  const [authorId, setAuthorId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [totalCopies, setTotalCopies] = useState<number | ''>(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverImageData, setCoverImageData] = useState<string>("");
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { id: 1, name: "Science" },
    { id: 3, name: "Finance" },
    { id: 4, name: "Self-Improvement" },
    { id: 9, name: "Fiction" },
    { id: 11, name: "Non-Fiction" },
    { id: 14, name: "Education" }
  ];

  const { data, isLoading } = useQuery<BookDetailResponse>({
    queryKey: ["book-detail", id],
    queryFn: async (): Promise<BookDetailResponse> => await fetchBookDetail(id!),
    enabled: !!id
  });

  const updateBookMutation = useMutation({
    mutationFn: async (payload: UpdateBookPayload) => {
      try {
        const { data } = await api.put(`/books/${id}`, payload);
        return data;
      } catch (error: unknown) {
        if (
          isAxiosError(error) &&
          error.response?.status === 409 &&
          typeof error.response?.data?.message === 'string' &&
          error.response.data.message.includes('ISBN')
        ) {
          const { data } = await api.put(`/books/${id}`, { ...payload, forceUpdate: true });
          return data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Book updated successfully");
      queryClient.invalidateQueries({ queryKey: ["book-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      navigate("/admin");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) ?? "Failed to update book");
    }
  });

  const createAuthorMutation = useMutation({
    mutationFn: async (authorData: { name: string; bio: string }) => {
      const { data } = await api.post('/authors', authorData);
      return data;
    },
    onSuccess: (data) => {
      toast.success("Author created successfully");
      setAuthorId(String(data.data.id));
      setAuthorName(data.data.name);
      setIsAuthorModalOpen(false);
      setNewAuthorName("");
      setAuthorBio("");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) ?? "Failed to create author");
    }
  });



  useEffect(() => {
    if (data?.book) {
      const book = data.book;
      setTitle(book.title || "");
      setDescription(book.description || "");
      setIsbn(book.isbn || "");
      setPublishedYear(book.publishedYear || "");
      const authorIdValue = String(book.authorId || book.author?.id || "");
      setAuthorId(authorIdValue);
      setAuthorName(book.author?.name || "");
      const categoryIdValue = String(book.categoryId || book.categories?.[0]?.id || "");
      setCategoryId(categoryIdValue);
      setTotalCopies(book.totalCopies || 1);
      const remoteCover = book.coverUrl || book.coverImage || "";
      setCoverImageData(remoteCover);
      setImagePreview(remoteCover || null);
    }
  }, [data]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!isbn.trim()) newErrors.isbn = "ISBN is required";
    if (!publishedYear) newErrors.publishedYear = "Published year is required";
    if (!authorId) newErrors.authorId = "Author is required";
    if (!categoryId) newErrors.categoryId = "Category is required";
    if (!totalCopies) newErrors.totalCopies = "Total copies is required";
    if (!coverImageData) newErrors.coverImage = "Cover image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const compressImage = (file: File, maxWidth = 800, quality = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Failed to read file"));
          return;
        }

        const img = new Image();
        img.onload = () => {
          const scale = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
          }

          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) {
      setImagePreview(null);
      setCoverImageData("");
      return;
    }

    if (!/^image\/(jpeg|png|webp)$/i.test(selectedFile.type)) {
      toast.error("Please select a JPG/PNG/WebP image.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      const dataUrl = await compressImage(selectedFile, 800, 0.72);
      setCoverImageData(dataUrl);
      setErrors((prev) => {
        if (!prev.coverImage) return prev;
        const updated = { ...prev };
        delete updated.coverImage;
        return updated;
      });
      setImagePreview(dataUrl);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) ?? "Failed to load image");
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setCoverImageData("");
  };

  const handleCreateAuthor = () => {
    if (!newAuthorName.trim()) {
      toast.error("Author name is required");
      return;
    }
    createAuthorMutation.mutate({ name: newAuthorName, bio: authorBio });
  };



  const handleSave = () => {
    if (!validate()) return;
    
    const payload = {
      title: title.trim(),
      description: description.trim(),
      isbn: isbn.trim(),
      publishedYear: Number(publishedYear) || 2024,
      coverImage: coverImageData,
      authorId: Number(authorId),
      categoryId: Number(categoryId),
      totalCopies: Number(totalCopies) || 1,
      availableCopies: Number(totalCopies) || 1
    };
    
    updateBookMutation.mutate(payload);
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("/admin")} className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-xl font-semibold">Edit Book</h1>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
          <Input 
            placeholder="Enter book ISBN"
            value={isbn} 
            onChange={(e) => setIsbn(e.target.value)}
            className={`h-12 ${errors.isbn ? "border-red-500" : ""}`}
          />
          {errors.isbn && <p className="text-red-500 text-xs mt-1">{errors.isbn}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
          <div className="flex gap-2">
            <Input 
              placeholder="Author name will appear here"
              value={authorName}
              readOnly
              className={`h-12 flex-1 bg-gray-50 ${errors.authorId ? "border-red-500" : ""}`}
            />
            <Dialog open={isAuthorModalOpen} onOpenChange={setIsAuthorModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-12 px-3">
                  <Plus className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Author</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <Input 
                      placeholder="Enter author name"
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <Textarea 
                      placeholder="Enter author bio"
                      value={authorBio}
                      onChange={(e) => setAuthorBio(e.target.value)}
                      className="min-h-20 resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAuthorModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateAuthor}
                      disabled={createAuthorMutation.isPending}
                      className="flex-1"
                    >
                      {createAuthorMutation.isPending ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Pages</label>
          <Input 
            type="number"
            placeholder="Enter number of pages"
            value={publishedYear}
            onChange={(e) => setPublishedYear(e.target.value ? Number(e.target.value) : '')}
            className={`h-12 ${errors.publishedYear ? "border-red-500" : ""}`}
          />
          {errors.publishedYear && <p className="text-red-500 text-xs mt-1">{errors.publishedYear}</p>}
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
                    onClick={handleRemoveImage}
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
            {errors.coverImage && (
              <p className="text-red-500 text-xs mt-2">{errors.coverImage}</p>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={updateBookMutation.isPending}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          {updateBookMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
