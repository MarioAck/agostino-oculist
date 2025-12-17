'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

interface Item {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
  image: string;
  images?: string[];
  category: string;
}

export default function NewSale() {
  const [saleItems, setSaleItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaleItems() {
      try {
        const response = await fetch('/api/items?category=sale');
        const data = await response.json();
        setSaleItems(data);
      } catch (error) {
        console.error('Failed to fetch sale items:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSaleItems();
  }, []);

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
      <header className="relative z-10 w-full px-4 md:px-8 lg:px-24 py-6 md:py-8">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        <div>
          <Link href="/">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#e8dcc4] tracking-wider hover:text-[#f5ecd7] transition-colors">
              AGOSTINO OCULIST
            </h1>
          </Link>
        </div>
        <nav className="flex gap-4 md:gap-6">
          <Link href="/" className="text-[#e8dcc4] hover:text-white transition-colors font-medium tracking-wide text-sm md:text-base">
            ← HOME
          </Link>
        </nav>
        </div>
      </header>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-24 py-8 md:py-12 flex-grow">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#e8dcc4] mb-3 md:mb-4 tracking-wide">
            50% OFF SALE
          </h1>
          <p className="text-base md:text-xl text-[#e8dcc4]/80 tracking-wide">
            Limited time offers on premium eyewear
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#e8dcc4] text-xl">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mx-auto">
            {saleItems.map((item) => (
            <Link
              key={item.id}
              href={`/item/${item.id}`}
              className="bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm rounded-lg overflow-hidden border border-[#e8dcc4]/10 hover:border-[#e8dcc4]/30 transition-all duration-300 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl cursor-pointer"
            >
              <div className="relative aspect-square bg-gradient-to-br from-[#3d2820]/50 to-[#1a1310]/50 flex items-center justify-center border-b border-[#e8dcc4]/10">
                <img
                  src={item.images && item.images.length > 0 ? item.images[0] : item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-[#e8dcc4] text-[#2d1810] px-3 md:px-4 py-1 md:py-2 rounded font-bold text-xs md:text-sm shadow-lg tracking-wide">
                  {item.discount}% OFF
                </div>
              </div>
              <div className="p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-[#e8dcc4] mb-2 tracking-wide">
                  {item.name}
                </h3>
                <p className="text-[#e8dcc4]/70 mb-3 md:mb-4 text-xs md:text-sm whitespace-pre-wrap">
                  {item.description}
                </p>
                <div className="mb-3 md:mb-4">
                  <span className="text-base md:text-lg text-[#e8dcc4]/50 line-through mr-2">
                    ${item.originalPrice}
                  </span>
                  <span className="text-2xl md:text-3xl font-bold text-[#e8dcc4]">
                    ${item.price}
                  </span>
                </div>
                <button className="w-full border-2 border-[#e8dcc4] text-[#e8dcc4] px-4 md:px-6 py-2 md:py-3 rounded font-semibold tracking-wide text-sm md:text-base hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300">
                  VIEW
                </button>
              </div>
            </Link>
            ))}
          </div>
        )}
      </div>

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
