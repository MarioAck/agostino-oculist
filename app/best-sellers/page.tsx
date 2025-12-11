import Link from "next/link";
import { readItemsData } from "@/lib/data";

async function getBestSellers() {
  const data = readItemsData();
  return data.bestSellers;
}

export default async function BestSellers() {
  const bestSellers = await getBestSellers();

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
          <Link href="/" className="text-[#e8dcc4] hover:text-white transition-colors font-medium tracking-wide">
            ← HOME
          </Link>
        </nav>
        </div>
      </header>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-24 py-12 flex-grow">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#e8dcc4] mb-4 tracking-wide">
            NEW ARRIVALS
          </h1>
          <p className="text-xl text-[#e8dcc4]/80 tracking-wide">
            Our customers' favorite eyewear selections
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto">
          {bestSellers.map((item: any) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm rounded-lg overflow-hidden border border-[#e8dcc4]/10 hover:border-[#e8dcc4]/30 transition-all duration-300 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl"
            >
              <div className="aspect-square bg-gradient-to-br from-[#3d2820]/50 to-[#1a1310]/50 flex items-center justify-center border-b border-[#e8dcc4]/10">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#e8dcc4] mb-2 tracking-wide">
                  {item.name}
                </h3>
                <p className="text-[#e8dcc4]/70 mb-4 text-sm">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-[#e8dcc4]">
                    ${item.price}
                  </span>
                  <button className="border-2 border-[#e8dcc4] text-[#e8dcc4] px-6 py-2 rounded font-semibold tracking-wide hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300">
                    VIEW
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full px-24 py-12 border-t border-[#e8dcc4]/20">
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
