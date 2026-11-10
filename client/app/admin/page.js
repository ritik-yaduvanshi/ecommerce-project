// client/app/admin/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "../../lib/apiClient";

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' or 'products'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // New product form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      alert("Access denied. Admins only.");
      router.push("/");
      return;
    }
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [ordersData, productsData] = await Promise.all([
        fetchAPI("/admin/orders"),
        fetchAPI("/products"),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await fetchAPI(`/admin/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setMessage("Order status updated successfully!");
      loadAdminData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          category,
          stock_quantity: Number(stockQuantity),
          image_url: imageUrl,
        }),
      });
      setMessage("Product created successfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStockQuantity("");
      setImageUrl("");
      loadAdminData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Loading admin dashboard...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
        Admin Dashboard
      </h1>

      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg font-medium">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg font-medium">
          {error}
        </div>
      )}

      {/* Tab Navigators */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-2 font-semibold text-lg cursor-pointer ${activeTab === "orders" ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-gray-600"}`}
        >
          Manage Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-2 font-semibold text-lg cursor-pointer ${activeTab === "products" ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-gray-600"}`}
        >
          Add / View Products ({products.length})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td className="p-4 font-bold text-gray-900">
                      #{order.order_id}
                    </td>
                    <td className="p-4 text-gray-700">
                      {order.user_name || "N/A"}
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-600 truncate max-w-xs">
                      {order.shipping_address}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(
                            order.order_id,
                            e.target.value,
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:ring-1 focus:ring-black"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add Product Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-1">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add New Product
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-md font-semibold text-sm hover:bg-gray-800 cursor-pointer"
              >
                Create Product
              </button>
            </form>
          </div>

          {/* Product List Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2 overflow-x-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Existing Products
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-xs font-semibold text-gray-600 uppercase">
                  <th className="p-2">Title</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {products.map((p) => (
                  <tr key={p.product_id}>
                    <td className="p-2 font-medium text-gray-900">{p.title}</td>
                    <td className="p-2 text-gray-600">{p.category}</td>
                    <td className="p-2 font-semibold">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="p-2">{p.stock_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
