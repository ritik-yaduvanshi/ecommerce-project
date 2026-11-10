// client/components/ProductCard.jsx
"use client";
import Link from "next/link";

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden flex flex-col justify-between">
      <div>
        <div className="w-full h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-sm">No Image Available</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {product.description}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">
              ${Number(product.price).toFixed(2)}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${product.stock_quantity > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {product.stock_quantity > 0
                ? `${product.stock_quantity} in stock`
                : "Out of stock"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={() => onAddToCart(product.product_id)}
          disabled={product.stock_quantity <= 0}
          className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
            product.stock_quantity > 0
              ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {product.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
