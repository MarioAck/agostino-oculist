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
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "originalPrice" || name === "discount"
          ? Number(value)
          : value,
    }));
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await fetch(`/api/items?id=${id}`, {
        method: "DELETE",
      });
      fetchItems();
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage your eyewear inventory
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/"
              className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              ← Back to Home
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors duration-200 font-semibold shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {editingItem
                ? "Edit Item"
                : isAddingNew
                  ? "Add New Item"
                  : "Item Management"}
            </h2>
            {!isAddingNew && !editingItem && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-full transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
              >
                + Add New Item
              </button>
            )}
          </div>

          {(isAddingNew || editingItem) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="best-seller">Best Seller</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>

                {formData.category === "sale" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Original Price ($)
                      </label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice || 0}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount || 0}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="0"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-gray-600 dark:file:text-gray-200 file:cursor-pointer file:transition-all"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Preview:
                      </p>
                      <div className="inline-block rounded-xl overflow-hidden border-4 border-purple-200 dark:border-purple-700 shadow-lg">
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter product description"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                >
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-full transition-all duration-200 font-semibold shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Best Sellers Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Best Sellers
            </h2>
            <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-lg font-semibold">
              {bestSellers.length}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestSellers.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 min-h-[48px]">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${item.price}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full transition-colors duration-200 font-semibold shadow-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors duration-200 font-semibold shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {bestSellers.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No best sellers yet. Add your first item!
              </p>
            </div>
          )}
        </div>

        {/* Sale Items Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Sale Items
            </h2>
            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-lg font-semibold">
              {saleItems.length}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {saleItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="relative aspect-square bg-gradient-to-br from-red-100 to-orange-200 dark:from-gray-700 dark:to-gray-600">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {item.discount}% OFF
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 min-h-[48px]">
                    {item.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-lg text-gray-500 dark:text-gray-400 line-through mr-2">
                      ${item.originalPrice}
                    </span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${item.price}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full transition-colors duration-200 font-semibold shadow-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors duration-200 font-semibold shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {saleItems.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No sale items yet. Add your first item!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
