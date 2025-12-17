'use client';

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface Item {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
  image: string;
  images: string[];
  category: string;
}

export default function ItemPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchItem() {
      try {
        const response = await fetch('/api/items');
        if (!response.ok) {
          setItem(null);
          return;
        }

        const data = await response.json();
        const allItems = [...(data.bestSellers || []), ...(data.saleItems || [])];
        const foundItem = allItems.find((item: Item) => item.id === id);

        setItem(foundItem || null);
      } catch (error) {
        console.error('Failed to fetch item:', error);
        setItem(null);
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2d1810] flex items-center justify-center">
        <p className="text-[#e8dcc4] text-xl">Loading...</p>
      </div>
    );
  }

  if (!item) {
    notFound();
  }

  const isOnSale = item.category === 'sale';
  const images = item.images && item.images.length > 0 ? item.images : [item.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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
      <header className="relative z-10 w-full px-24 py-8">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div>
            <Link href="/">
              <h1 className="text-2xl md:text-3xl font-bold text-[#e8dcc4] tracking-wider hover:text-[#f5ecd7] transition-colors">
                AGOSTINO OCULIST
              </h1>
            </Link>
          </div>
          <nav className="flex gap-6">
            <Link href={item.category === 'sale' ? '/new-sale' : '/best-sellers'} className="text-[#e8dcc4] hover:text-white transition-colors font-medium tracking-wide">
              ← BACK
            </Link>
            <Link href="/" className="text-[#e8dcc4] hover:text-white transition-colors font-medium tracking-wide">
              HOME
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-24 py-12 flex-grow">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Side - Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm rounded-lg overflow-hidden border border-[#e8dcc4]/10 shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-[#3d2820]/50 to-[#1a1310]/50 flex items-center justify-center relative">
                <img
                  src={images[currentImageIndex]}
                  alt={`${item.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {isOnSale && item.discount && (
                  <div className="absolute top-6 right-6 bg-[#e8dcc4] text-[#2d1810] px-6 py-3 rounded font-bold text-lg shadow-lg tracking-wide z-10">
                    {item.discount}% OFF
                  </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#e8dcc4]/90 hover:bg-[#e8dcc4] text-[#2d1810] p-3 rounded-full transition-all duration-300 shadow-lg"
                      aria-label="Previous image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#e8dcc4]/90 hover:bg-[#e8dcc4] text-[#2d1810] p-3 rounded-full transition-all duration-300 shadow-lg"
                      aria-label="Next image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#e8dcc4]/90 text-[#2d1810] px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      index === currentImageIndex
                        ? "border-[#e8dcc4] ring-2 ring-[#e8dcc4]/50"
                        : "border-[#e8dcc4]/20 hover:border-[#e8dcc4]/50"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Details */}
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#e8dcc4] mb-6 tracking-wide">
                {item.name}
              </h1>

              {/* Price Section */}
              <div className="mb-8">
                {isOnSale && item.originalPrice ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-2xl text-[#e8dcc4]/50 line-through tracking-wide">
                      ${item.originalPrice}
                    </span>
                    <span className="text-5xl font-bold text-[#e8dcc4]">
                      ${item.price}
                    </span>
                    <span className="text-xl text-[#e8dcc4]/70 tracking-wide">
                      Save ${(item.originalPrice - item.price).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-5xl font-bold text-[#e8dcc4]">
                    ${item.price}
                  </span>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm rounded-lg p-8 border border-[#e8dcc4]/10">
              <h2 className="text-2xl font-bold text-[#e8dcc4] mb-4 tracking-wide">
                Description
              </h2>
              <p className="text-[#e8dcc4]/80 text-lg leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Action Button */}
            <button className="w-full border-2 border-[#e8dcc4] text-[#e8dcc4] px-8 py-4 rounded-lg font-bold text-xl tracking-wider hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300 shadow-lg">
              ADD TO CART
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full px-24 py-12 mt-12 border-t border-[#e8dcc4]/20">
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
