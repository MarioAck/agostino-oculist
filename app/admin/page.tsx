"use client";

import { useState, useEffect } from "react";
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
    category: "best-seller",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [priceError, setPriceError] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image || "";

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      if (!imageUrl) {
        alert("Please upload an image");
        return;
      }

      const itemData = { ...formData, image: imageUrl };

      if (editingItem) {
        await fetch("/api/items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...itemData, id: editingItem.id }),
        });
      } else {
        const categoryItems =
          formData.category === "best-seller" ? bestSellers : saleItems;
        const prefix = formData.category === "best-seller" ? "bs" : "sale";
        const newId = `${prefix}${categoryItems.length + 1}`;

        await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...itemData, id: newId }),
        });
      }

      fetchItems();
      resetForm();
    } catch (error) {
      console.error("Failed to save item:", error);
      alert("Failed to save item. Please try again.");
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData(item);
    setImagePreview(item.image);
    setSelectedFile(null);
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
      category: "best-seller",
    });
    setEditingItem(null);
    setIsAddingNew(false);
    setSelectedFile(null);
    setImagePreview("");
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
      <header className="relative z-10 w-full px-24 py-8 border-b border-[#e8dcc4]/10">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-bold text-[#e8dcc4] mb-2 tracking-wide">
            ADMIN DASHBOARD
          </h1>
          <p className="text-xl text-[#e8dcc4]/80 tracking-wide">
            Manage your eyewear inventory
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Link
            href="/"
            className="text-[#e8dcc4] hover:text-white font-medium tracking-wide"
          >
            ← BACK TO HOME
          </Link>
          <button
            onClick={handleLogout}
            className="border-2 border-[#e8dcc4] text-[#e8dcc4] px-6 py-2 rounded font-semibold tracking-wide hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300"
          >
            LOGOUT
          </button>
        </div>
        </div>
      </header>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-24 py-16 flex-grow">

        {/* Add/Edit Form */}
        <div className="bg-gradient-to-br from-[#1a1310]/90 to-[#2d1810]/90 backdrop-blur-sm rounded-lg shadow-2xl p-8 mb-12 border border-[#e8dcc4]/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-[#e8dcc4] tracking-wide">
              {editingItem
                ? "EDIT ITEM"
                : isAddingNew
                  ? "ADD NEW ITEM"
                  : "ITEM MANAGEMENT"}
            </h2>
            {!isAddingNew && !editingItem && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="border-2 border-[#e8dcc4] text-[#e8dcc4] px-6 py-3 rounded font-semibold tracking-wider hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300"
              >
                + ADD NEW ITEM
              </button>
            )}
          </div>

          {(isAddingNew || editingItem) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                    NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all placeholder-[#e8dcc4]/40"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                    CATEGORY
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all"
                  >
                    <option value="best-seller">Best Seller</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                    PRICE ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all placeholder-[#e8dcc4]/40"
                    placeholder="0.00"
                  />
                </div>

                {formData.category === "sale" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                        ORIGINAL PRICE ($)
                      </label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice || 0}
                        onChange={handleInputChange}
                        step="0.01"
                        className={`w-full px-4 py-3 border-2 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 transition-all placeholder-[#e8dcc4]/40 ${
                          priceError
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-[#e8dcc4]/30 focus:ring-[#e8dcc4] focus:border-[#e8dcc4]"
                        }`}
                        placeholder="0.00"
                      />
                      {priceError && (
                        <p className="mt-2 text-sm text-red-400">{priceError}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
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
                        className="w-full px-4 py-3 border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all placeholder-[#e8dcc4]/40"
                        placeholder="0"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                    PRODUCT IMAGE
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] file:mr-4 file:py-2 file:px-6 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#e8dcc4] file:text-[#2d1810] hover:file:bg-[#f5ecd7] file:cursor-pointer file:transition-all"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-[#e8dcc4]/80 mb-2">
                        PREVIEW:
                      </p>
                      <div className="inline-block rounded overflow-hidden border-4 border-[#e8dcc4]/30 shadow-lg">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-40 h-40 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#e8dcc4] mb-2 tracking-wide">
                  DESCRIPTION
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all placeholder-[#e8dcc4]/40"
                  placeholder="Enter product description"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="border-2 border-[#e8dcc4] text-[#e8dcc4] px-8 py-3 rounded font-semibold tracking-wider hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300"
                >
                  {editingItem ? "UPDATE ITEM" : "ADD ITEM"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="border-2 border-[#e8dcc4]/50 text-[#e8dcc4]/70 px-8 py-3 rounded font-semibold tracking-wider hover:border-[#e8dcc4] hover:text-[#e8dcc4] transition-all duration-300"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Best Sellers Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-4xl font-bold text-[#e8dcc4] tracking-wide">
              BEST SELLERS
            </h2>
            <span className="bg-[#e8dcc4] text-[#2d1810] px-4 py-1 rounded text-lg font-semibold">
              {bestSellers.length}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestSellers.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-[#e8dcc4]/10"
              >
                <div className="relative aspect-square bg-gradient-to-br from-[#3d2820]/50 to-[#1a1310]/50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#e8dcc4] mb-2 tracking-wide">
                    {item.name}
                  </h3>
                  <p className="text-[#e8dcc4]/70 mb-4 min-h-[48px] text-sm">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-[#e8dcc4]">
                      ${item.price}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 border-2 border-[#e8dcc4] text-[#e8dcc4] px-4 py-2 rounded transition-all duration-200 font-semibold hover:bg-[#e8dcc4] hover:text-[#2d1810]"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 border-2 border-red-700 text-red-400 px-4 py-2 rounded transition-all duration-200 font-semibold hover:bg-red-700 hover:text-white"
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
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-4xl font-bold text-[#e8dcc4] tracking-wide">
              SALE ITEMS
            </h2>
            <span className="bg-[#e8dcc4] text-[#2d1810] px-4 py-1 rounded text-lg font-semibold">
              {saleItems.length}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {saleItems.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-[#e8dcc4]/10"
              >
                <div className="relative aspect-square bg-gradient-to-br from-[#3d2820]/50 to-[#1a1310]/50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-[#e8dcc4] text-[#2d1810] px-3 py-1 rounded text-sm font-bold shadow-lg">
                    {item.discount}% OFF
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#e8dcc4] mb-2 tracking-wide">
                    {item.name}
                  </h3>
                  <p className="text-[#e8dcc4]/70 mb-4 min-h-[48px] text-sm">
                    {item.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-lg text-[#e8dcc4]/50 line-through mr-2">
                      ${item.originalPrice}
                    </span>
                    <span className="text-2xl font-bold text-[#e8dcc4]">
                      ${item.price}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 border-2 border-[#e8dcc4] text-[#e8dcc4] px-4 py-2 rounded transition-all duration-200 font-semibold hover:bg-[#e8dcc4] hover:text-[#2d1810]"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 border-2 border-red-700 text-red-400 px-4 py-2 rounded transition-all duration-200 font-semibold hover:bg-red-700 hover:text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#1a1310]/95 to-[#2d1810]/95 backdrop-blur-md rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-[#e8dcc4]/30">
            <h3 className="text-2xl font-bold text-[#e8dcc4] mb-4 tracking-wide">
              CONFIRM DELETE
            </h3>
            <p className="text-[#e8dcc4]/80 mb-8 text-lg">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded font-semibold tracking-wider transition-all duration-300 border-2 border-red-700 hover:border-red-600"
              >
                DELETE
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 border-2 border-[#e8dcc4] text-[#e8dcc4] px-6 py-3 rounded font-semibold tracking-wider hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full px-24 py-12 border-t border-[#e8dcc4]/20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#e8dcc4] tracking-wider">
              AGOSTINO OCULIST
            </h2>
          </div>
          <nav className="flex flex-wrap gap-6 md:gap-8 justify-center">
            <a href="#privacy" className="text-[#e8dcc4] hover:text-white transition-colors text-sm tracking-wide">
              PRIVACY POLICY
            </a>
            <a href="#terms" className="text-[#e8dcc4] hover:text-white transition-colors text-sm tracking-wide">
              TERMS OF SERVICE
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
