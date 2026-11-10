// client/app/cart/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "../../lib/apiClient";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const data = await fetchAPI("/cart");
      setCartItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartId, quantity) => {
    if (quantity < 1) return;
    try {
      await fetchAPI(`/cart/${cartId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
      loadCart();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveItem = async (cartId) => {
    try {
      await fetchAPI(`/cart/${cartId}`, {
        method: "DELETE",
      });
      loadCart();
    } catch (err) {
      alert(err.message);
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
      .toFixed(2);
  };

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Loading your cart...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg font-medium">
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-lg mb-4">
            Your cart is currently empty.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div
                key={item.cart_id}
                className="p-6 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ${Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.cart_id, item.quantity - 1)
                      }
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-gray-900 font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.cart_id, item.quantity + 1)
                      }
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-lg font-bold text-gray-900 w-24 text-right">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleRemoveItem(item.cart_id)}
                    className="text-red-500 hover:text-red-700 font-semibold text-sm cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">Total: </span>
              <span className="text-2xl font-extrabold text-gray-900">
                ${calculateTotal()}
              </span>
            </div>
            <button
              onClick={() => router.push("/checkout")}
              className="bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
