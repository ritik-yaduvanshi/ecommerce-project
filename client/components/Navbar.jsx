// client/components/Navbar.jsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(role === "admin");
      setUserName(name || "User");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-gray-900"
        >
          🛍️ E-Shop
        </Link>

        <div className="flex items-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-black font-medium">
            Catalog
          </Link>
          <Link
            href="/cart"
            className="text-gray-600 hover:text-black font-medium"
          >
            Cart 🛒
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-purple-700"
                >
                  Admin Dashboard
                </Link>
              )}
              <span className="text-gray-700 font-medium text-sm">
                Hi, {userName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-red-600 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-gray-600 hover:text-black font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-black text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-800"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
