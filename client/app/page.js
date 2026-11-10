// client/app/page.js
"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "../lib/apiClient";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      let query = "/products?";
      if (selectedCategory)
        query += `category=${encodeURIComponent(selectedCategory)}&`;
      if (searchQuery) query += `search=${encodeURIComponent(searchQuery)}`;

      const data = await fetchAPI(query);

      // Safely ensure productList is always an array
      const productList = Array.isArray(data)
        ? data
        : data.products || data.items || data.data || [];
      setProducts(productList);

      // Extract unique categories safely
      const allCats = [
        ...new Set(productList.map((p) => p.category).filter(Boolean)),
      ];
      setCategories(allCats);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add items to your cart.");
      window.location.href = "/login";
      return;
    }

    try {
      await fetchAPI("/cart", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      setMessage("Product added to cart successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Hero / Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-2xl mb-8 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Discover Quality Products
        </h1>
        <p className="mt-2 text-gray-300 max-w-xl">
          Browse our curated collection of top-tier items built with speed,
          reliability, and security.
        </p>
      </div>

      {/* Notification Toast */}
      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg shadow-sm font-medium">
          {message}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-gray-700">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6 font-medium">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-medium">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
