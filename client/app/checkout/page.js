// client/app/checkout/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "../../lib/apiClient";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      if (data.length === 0) {
        router.push("/cart");
        return;
      }
      setCartItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
      .toFixed(2);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await fetchAPI("/orders", {
        method: "POST",
        body: JSON.stringify({ shipping_address: shippingAddress }),
      });
      alert(`Order placed successfully! Order ID: ${data.orderId}`);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Preparing checkout...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg font-medium">
          {error}
        </div>
      )}

      <div className="mb-8 border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Order Summary
        </h3>
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div
              key={item.cart_id}
              className="flex justify-between text-sm text-gray-600"
            >
              <span>
                {item.title} × {item.quantity}
              </span>
              <span className="font-medium text-gray-900">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-base font-bold text-gray-900">
            Total Amount:
          </span>
          <span className="text-xl font-extrabold text-gray-900">
            ${calculateTotal()}
          </span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Address
          </label>
          <textarea
            rows="3"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
            placeholder="123 Main Street, City, Country, Postal Code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors cursor-pointer disabled:bg-gray-400"
        >
          {submitting ? "Processing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}
