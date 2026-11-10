import "./globals.css";

export const metadata = {
  title: "E-Commerce Store",
  description: "Full-stack e-commerce application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
