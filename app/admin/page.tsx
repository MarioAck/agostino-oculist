"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Item } from "@/lib/data";

export default function AdminPage() {
  const [bestSellers, setBestSellers] = useState<Item[]>([]);
  const [saleItems, setSaleItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Item>>({
    name: "",
    price: 0,
    description: "",
    image: "",
    images: [],
    category: "best-seller",
  });
  const [imageItems, setImageItems] = useState<Array<{ url: string; file?: File; tempId?: string }>>([]);
  const [priceError, setPriceError] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check");
      if (response.ok) {
        setIsAuthenticated(true);
        fetchItems();
      } else {
        router.push("/admin/login");
      }
    } catch (error) {
      router.push("/admin/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const fetchItems = async () => {
    try {
      console.log("Fetching items from /api/items...");
      const response = await fetch("/api/items");
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        alert(`Failed to load items: ${errorData.error || "Unknown error"}`);
        return;
      }

      const data = await response.json();
      console.log("Received data:", data);
      console.log("Best sellers count:", data.bestSellers?.length || 0);
      console.log("Sale items count:", data.saleItems?.length || 0);

      setBestSellers(data.bestSellers || []);
      setSaleItems(data.saleItems || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      alert("Failed to fetch items. Check console for details.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const numValue = Number(value);

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]:
          name === "price" || name === "originalPrice" || name === "discount"
            ? numValue
            : value,
      };

      // Only calculate for sale items
      if (prev.category === "sale") {
        // If originalPrice and discount are set, calculate price only
        if (name === "originalPrice" && numValue > 0 && updated.discount != null && updated.discount !== 0) {
          setPriceError("");
          updated.price = Math.round(numValue * (1 - updated.discount / 100) * 100) / 100;
        } else if (name === "discount" && numValue !== 0 && updated.originalPrice && updated.originalPrice > 0) {
          setPriceError("");
          updated.price = Math.round(updated.originalPrice * (1 - numValue / 100) * 100) / 100;
        }
      }

      return updated;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Upload files immediately and show optimized previews
      for (const file of files) {
        try {
          // Show temporary loading preview
          const tempId = `temp-${Date.now()}-${Math.random()}`;
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageItems((prev) => [...prev, { url: reader.result as string, file, tempId }]);
          };
          reader.readAsDataURL(file);

          // Upload immediately
          console.log('[Admin] Uploading file immediately:', file.name);
          const uploadedUrl = await uploadImage(file);

          // Replace temporary preview with optimized image
          setImageItems((prev) =>
            prev.map(item =>
              item.tempId === tempId
                ? { url: uploadedUrl } // Remove file and tempId, use server URL
                : item
            )
          );
        } catch (error) {
          console.error('[Admin] Failed to upload file:', file.name, error);
          alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Remove failed item
          setImageItems((prev) => prev.filter(item => item.file !== file));
        }
      }
    }

    // Clear input to allow re-uploading same file
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageItems((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newItems = [...imageItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    setImageItems(newItems);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const uploadImage = async (file: File): Promise<string> => {
    console.log('[Admin] Uploading file:', file.name, file.type, file.size);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    console.log('[Admin] Upload response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[Admin] Upload failed:', errorData);
      throw new Error(errorData.error || "Failed to upload image");
    }

    const data = await response.json();
    console.log('[Admin] Upload successful:', data);
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('[Admin] Starting form submission');
      console.log('[Admin] Image items:', imageItems.length);

      if (imageItems.length === 0) {
        alert("Please upload at least one image");
        return;
      }

      // Check if any images are still uploading
      const hasUnuploadedFiles = imageItems.some(item => item.file || item.tempId);
      if (hasUnuploadedFiles) {
        alert("Please wait for all images to finish uploading");
        return;
      }

      // All images are already uploaded, just collect URLs
      const finalImageUrls = imageItems.map(item => item.url);

      console.log('[Admin] Final image URLs:', finalImageUrls);

      const itemData = {
        ...formData,
        images: finalImageUrls,
        image: finalImageUrls[0] // First image for backward compatibility
      };

      console.log('[Admin] Submitting item data:', {
        id: editingItem?.id,
        category: itemData.category,
        imageCount: finalImageUrls.length
      });

      if (editingItem) {
        const response = await fetch("/api/items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...itemData, id: editingItem.id }),
        });

        console.log('[Admin] Update response status:', response.status);

        if (!response.ok) {
          const error = await response.json();
          console.error('[Admin] Update failed:', error);
          throw new Error(error.error || 'Failed to update item');
        }
      } else {
        // Generate a unique UUID for the new item
        const newId = crypto.randomUUID();

        const response = await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...itemData, id: newId }),
        });

        console.log('[Admin] Create response status:', response.status);

        if (!response.ok) {
          const error = await response.json();
          console.error('[Admin] Create failed:', error);
          throw new Error(error.error || 'Failed to add item');
        }
      }

      console.log('[Admin] Item saved successfully');
      fetchItems();
      resetForm();
    } catch (error) {
      console.error("[Admin] Failed to save item:", error);
      alert(`Failed to save item: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData(item);
    // Load existing images or fallback to single image
    const images = item.images && item.images.length > 0 ? item.images : [item.image];
    setImageItems(images.map(url => ({ url })));
    setIsAddingNew(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await fetch(`/api/items?id=${itemToDelete}`, {
        method: "DELETE",
      });
      fetchItems();
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      description: "",
      image: "",
      images: [],
      category: "best-seller",
    });
    setEditingItem(null);
    setIsAddingNew(false);
    setImageItems([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2d1810] flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold text-[#e8dcc4]">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#2d1810] relative overflow-hidden flex flex-col">
      {/* Textured Background Overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />

      {/* Rust/Brown Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-red-900/20" />
      {/* Header */}
      <header className="relative z-10 w-full px-4 md:px-8 lg:px-24 py-6 md:py-8 border-b border-[#e8dcc4]/10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#e8dcc4] mb-2 tracking-wide">
            ADMIN DASHBOARD
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-[#e8dcc4]/80 tracking-wide">
            Manage your eyewear inventory
          </p>
        </div>
        <div className="flex gap-3 md:gap-4 items-center">
          <Link
            href="/"
            className="text-[#e8dcc4] hover:text-white font-medium tracking-wide text-sm md:text-base"
          >
            ← BACK TO HOME
          </Link>
          <button
            onClick={handleLogout}
            className="border-2 border-[#e8dcc4] text-[#e8dcc4] px-4 md:px-6 py-2 rounded font-semibold tracking-wide text-sm md:text-base hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300"
          >
            LOGOUT
          </button>
        </div>
        </div>
      </header>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-24 py-8 md:py-12 lg:py-16 flex-grow">

        {/* Add/Edit Form */}
        <div className="bg-gradient-to-br from-[#1a1310]/90 to-[#2d1810]/90 backdrop-blur-sm rounded-lg shadow-2xl p-4 md:p-6 lg:p-8 mb-8 md:mb-12 border border-[#e8dcc4]/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#e8dcc4] tracking-wide">
              {editingItem
                ? "EDIT ITEM"
                : isAddingNew
                  ? "ADD NEW ITEM"
                  : "ITEM MANAGEMENT"}
            </h2>
            {!isAddingNew && !editingItem && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="border-2 border-[#e8dcc4] text-[#e8dcc4] px-4 md:px-6 py-2 md:py-3 rounded font-semibold tracking-wider text-sm md:text-base hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300"
              >
                + ADD NEW ITEM
              </button>
            )}
          </div>

          {(isAddingNew || editingItem) && (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                    NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all placeholder-[#e8dcc4]/40"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                    CATEGORY
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all"
                  >
                    <option value="best-seller">Best Seller</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                    PRICE ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all placeholder-[#e8dcc4]/40"
                    placeholder="0.00"
                  />
                </div>

                {formData.category === "sale" && (
                  <>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                        ORIGINAL PRICE ($)
                      </label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice || 0}
                        onChange={handleInputChange}
                        step="0.01"
                        className={`w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 transition-all placeholder-[#e8dcc4]/40 ${
                          priceError
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-[#e8dcc4]/30 focus:ring-[#e8dcc4] focus:border-[#e8dcc4]"
                        }`}
                        placeholder="0.00"
                      />
                      {priceError && (
                        <p className="mt-2 text-xs md:text-sm text-red-400">{priceError}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                        DISCOUNT (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={Math.round(formData.discount || 0)}
                        onChange={handleInputChange}
                        step="1"
                        min="0"
                        max="100"
                        className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all placeholder-[#e8dcc4]/40"
                        placeholder="0"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-xs md:text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                    PRODUCT IMAGES
                  </label>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <p className="text-xs text-[#e8dcc4]/60 mb-3">
                    Click the + button to add images. Images upload immediately and are automatically optimized to 2000x2000px high-quality WebP (up to ~5MB). Max 50MB upload. Drag to reorder.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {/* Add Image Button - Shows at start if no images */}
                    {imageItems.length === 0 && (
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="relative aspect-square rounded overflow-hidden border-2 border-dashed border-[#e8dcc4]/30 hover:border-[#e8dcc4]/60 transition-all duration-300 bg-gradient-to-br from-[#1a1310]/50 to-[#2d1810]/50 hover:from-[#1a1310]/70 hover:to-[#2d1810]/70 cursor-pointer group"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <svg className="w-12 h-12 text-[#e8dcc4]/50 group-hover:text-[#e8dcc4]/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-[#e8dcc4]/70 group-hover:text-[#e8dcc4] text-xs md:text-sm font-semibold tracking-wide transition-colors">
                            ADD IMAGES
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Image previews */}
                    {imageItems.map((item, index) => (
                          <div
                            key={index}
                            draggable={!item.tempId && !item.file}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`relative rounded overflow-hidden border-2 border-[#e8dcc4]/30 shadow-lg transition-all ${
                              item.tempId || item.file
                                ? "cursor-wait opacity-60"
                                : "cursor-move hover:border-[#e8dcc4]/60"
                            } ${draggedIndex === index ? "opacity-50" : ""}`}
                          >
                            <img
                              src={item.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 md:h-40 object-cover"
                            />
                            {(item.tempId || item.file) && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-[#e8dcc4] text-xs font-bold">
                                  Uploading...
                                </div>
                              </div>
                            )}
                            {index === 0 && !(item.tempId || item.file) && (
                              <div className="absolute top-1 left-1 bg-[#e8dcc4] text-[#2d1810] px-2 py-0.5 rounded text-xs font-bold">
                                MAIN
                              </div>
                            )}
                            {!(item.tempId || item.file) && (
                              <>
                                <div className="absolute top-1 right-1 flex gap-1">
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => moveImage(index, index - 1)}
                                      className="bg-[#e8dcc4] text-[#2d1810] p-1 rounded hover:bg-[#f5ecd7] transition-all"
                                      title="Move left"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </button>
                                  )}
                                  {index < imageItems.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => moveImage(index, index + 1)}
                                      className="bg-[#e8dcc4] text-[#2d1810] p-1 rounded hover:bg-[#f5ecd7] transition-all"
                                      title="Move right"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute bottom-1 right-1 bg-red-700 text-white p-1 rounded hover:bg-red-600 transition-all"
                                  title="Remove image"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        ))}

                    {/* Add More Images Button - Shows at end of list */}
                    {imageItems.length > 0 && (
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="relative aspect-square rounded overflow-hidden border-2 border-dashed border-[#e8dcc4]/30 hover:border-[#e8dcc4]/60 transition-all duration-300 bg-gradient-to-br from-[#1a1310]/50 to-[#2d1810]/50 hover:from-[#1a1310]/70 hover:to-[#2d1810]/70 cursor-pointer group"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <svg className="w-12 h-12 text-[#e8dcc4]/50 group-hover:text-[#e8dcc4]/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-[#e8dcc4]/70 group-hover:text-[#e8dcc4] text-xs md:text-sm font-semibold tracking-wide transition-colors">
                            ADD MORE
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                  DESCRIPTION
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all placeholder-[#e8dcc4]/40"
                  placeholder="Enter product description"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
                <button
                  type="submit"
                  className="border-2 border-[#e8dcc4] text-[#e8dcc4] px-6 md:px-8 py-2 md:py-3 rounded font-semibold tracking-wider text-sm md:text-base hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300"
                >
                  {editingItem ? "UPDATE ITEM" : "ADD ITEM"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="border-2 border-[#e8dcc4]/50 text-[#e8dcc4]/70 px-6 md:px-8 py-2 md:py-3 rounded font-semibold tracking-wider text-sm md:text-base hover:border-[#e8dcc4] hover:text-[#e8dcc4] transition-all duration-300"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Best Sellers Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#e8dcc4] tracking-wide">
              BEST SELLERS
            </h2>
            <span className="bg-[#e8dcc4] text-[#2d1810] px-3 md:px-4 py-1 rounded text-sm md:text-base lg:text-lg font-semibold">
              {bestSellers.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {bestSellers.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-[#e8dcc4]/10"
              >
                <div className="relative aspect-square bg-gradient-to-br from-[#3d2820]/50 to-[#1a1310]/50">
                  <img
                    src={item.images && item.images.length > 0 ? item.images[0] : item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.images && item.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-[#e8dcc4]/90 text-[#2d1810] px-2 py-1 rounded text-xs font-bold">
                      +{item.images.length - 1} more
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-[#e8dcc4] mb-2 tracking-wide">
                    {item.name}
                  </h3>
                  <p className="text-[#e8dcc4]/70 mb-3 md:mb-4 min-h-[40px] md:min-h-[48px] text-xs md:text-sm">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <span className="text-xl md:text-2xl font-bold text-[#e8dcc4]">
                      ${item.price}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <Link
                      href={`/item/${item.id}`}
                      className="flex-1 border-2 border-[#e8dcc4]/50 text-[#e8dcc4] px-3 md:px-4 py-2 rounded transition-all duration-200 font-semibold text-sm md:text-base hover:bg-[#e8dcc4]/10 hover:border-[#e8dcc4] text-center"
                    >
                      VIEW
                    </Link>
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 border-2 border-[#e8dcc4] text-[#e8dcc4] px-3 md:px-4 py-2 rounded transition-all duration-200 font-semibold text-sm md:text-base hover:bg-[#e8dcc4] hover:text-[#2d1810]"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 border-2 border-red-700 text-red-400 px-3 md:px-4 py-2 rounded transition-all duration-200 font-semibold text-sm md:text-base hover:bg-red-700 hover:text-white"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {bestSellers.length === 0 && (
            <div className="text-center py-16 bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm rounded-lg shadow-lg border border-[#e8dcc4]/10">
              <p className="text-[#e8dcc4]/70 text-lg">
                No best sellers yet. Add your first item!
              </p>
            </div>
          )}
        </div>

        {/* Sale Items Section */}
        <div>
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#e8dcc4] tracking-wide">
              SALE ITEMS
            </h2>
            <span className="bg-[#e8dcc4] text-[#2d1810] px-3 md:px-4 py-1 rounded text-sm md:text-base lg:text-lg font-semibold">
              {saleItems.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {saleItems.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-[#e8dcc4]/10"
              >
                <div className="relative aspect-square bg-gradient-to-br from-[#3d2820]/50 to-[#1a1310]/50">
                  <img
                    src={item.images && item.images.length > 0 ? item.images[0] : item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-[#e8dcc4] text-[#2d1810] px-2 md:px-3 py-1 rounded text-xs md:text-sm font-bold shadow-lg">
                    {item.discount}% OFF
                  </div>
                  {item.images && item.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-[#e8dcc4]/90 text-[#2d1810] px-2 py-1 rounded text-xs font-bold">
                      +{item.images.length - 1} more
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-[#e8dcc4] mb-2 tracking-wide">
                    {item.name}
                  </h3>
                  <p className="text-[#e8dcc4]/70 mb-3 md:mb-4 min-h-[40px] md:min-h-[48px] text-xs md:text-sm">
                    {item.description}
                  </p>
                  <div className="mb-3 md:mb-4">
                    <span className="text-base md:text-lg text-[#e8dcc4]/50 line-through mr-2">
                      ${item.originalPrice}
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-[#e8dcc4]">
                      ${item.price}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <Link
                      href={`/item/${item.id}`}
                      className="flex-1 border-2 border-[#e8dcc4]/50 text-[#e8dcc4] px-3 md:px-4 py-2 rounded transition-all duration-200 font-semibold text-sm md:text-base hover:bg-[#e8dcc4]/10 hover:border-[#e8dcc4] text-center"
                    >
                      VIEW
                    </Link>
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 border-2 border-[#e8dcc4] text-[#e8dcc4] px-3 md:px-4 py-2 rounded transition-all duration-200 font-semibold text-sm md:text-base hover:bg-[#e8dcc4] hover:text-[#2d1810]"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 border-2 border-red-700 text-red-400 px-3 md:px-4 py-2 rounded transition-all duration-200 font-semibold text-sm md:text-base hover:bg-red-700 hover:text-white"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {saleItems.length === 0 && (
            <div className="text-center py-16 bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm rounded-lg shadow-lg border border-[#e8dcc4]/10">
              <p className="text-[#e8dcc4]/70 text-lg">
                No sale items yet. Add your first item!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-gradient-to-br from-[#1a1310]/95 to-[#2d1810]/95 backdrop-blur-md rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full border-2 border-[#e8dcc4]/30">
            <h3 className="text-xl md:text-2xl font-bold text-[#e8dcc4] mb-3 md:mb-4 tracking-wide">
              CONFIRM DELETE
            </h3>
            <p className="text-[#e8dcc4]/80 mb-6 md:mb-8 text-base md:text-lg">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white px-4 md:px-6 py-2 md:py-3 rounded font-semibold tracking-wider text-sm md:text-base transition-all duration-300 border-2 border-red-700 hover:border-red-600"
              >
                DELETE
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 border-2 border-[#e8dcc4] text-[#e8dcc4] px-4 md:px-6 py-2 md:py-3 rounded font-semibold tracking-wider text-sm md:text-base hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 md:px-8 lg:px-24 py-8 md:py-12 border-t border-[#e8dcc4]/20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#e8dcc4] tracking-wider">
              AGOSTINO OCULIST
            </h2>
          </div>
          <nav className="flex flex-wrap gap-4 md:gap-6 lg:gap-8 justify-center">
            <a href="#privacy" className="text-[#e8dcc4] hover:text-white transition-colors text-xs md:text-sm tracking-wide">
              PRIVACY POLICY
            </a>
            <a href="#terms" className="text-[#e8dcc4] hover:text-white transition-colors text-xs md:text-sm tracking-wide">
              TERMS OF SERVICE
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
