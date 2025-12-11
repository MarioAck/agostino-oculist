import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#2d1810] relative overflow-hidden flex flex-col">
      {/* Textured Background Overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
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
          <nav className="hidden md:flex gap-8">
          <Link
            href="/"
            className="text-[#e8dcc4] hover:text-white transition-colors font-medium tracking-wide"
          >
            HOME
          </Link>
          <Link
            href="/best-sellers"
            className="text-[#e8dcc4] hover:text-white transition-colors font-medium tracking-wide"
          >
            SHOP
          </Link>
          <a
            href="#contact"
            className="text-[#e8dcc4] hover:text-white transition-colors font-medium tracking-wide"
          >
            CONTACT
          </a>
        </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-24 py-12 flex-grow">
        {/* Hero Section 1 - New Arrivals (Best Sellers) */}
        <Link href="/best-sellers">
          <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm border border-[#e8dcc4]/10 cursor-pointer hover:border-[#e8dcc4]/30 transition-all duration-300 mb-6">
            <div className="grid md:grid-cols-2 gap-8 items-center min-h-[400px] p-6 md:p-12">
              {/* Left Content */}
              <div className="text-left space-y-6">
                <h2 className="text-5xl md:text-7xl font-bold text-[#e8dcc4] leading-tight tracking-wide">
                  NEW
                  <br />
                  ARRIVALS
                </h2>
                <button className="border-2 border-[#e8dcc4] text-[#e8dcc4] px-8 py-4 text-lg font-semibold tracking-wider hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300 rounded">
                  SHOP NOW
                </button>
              </div>

              {/* Right Image Placeholder */}
              <div className="flex items-center justify-center">
                <div className="relative w-full h-[320px] bg-gradient-to-br from-[#3d2820]/50 to-[#1a1310]/50 rounded-lg flex items-center justify-center border border-[#e8dcc4]/20">
                  <div className="text-center space-y-4">
                    <div className="text-7xl">👓</div>
                    <p className="text-[#e8dcc4]/60 text-sm">
                      Best Sellers Collection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Link>

        {/* Hero Section 2 - 50% Off Sale */}
        <Link href="/new-sale">
          <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm border border-[#e8dcc4]/10 cursor-pointer hover:border-[#e8dcc4]/30 transition-all duration-300">
            <div className="grid md:grid-cols-2 gap-8 items-center min-h-[400px] p-6 md:p-12">
              {/* Left Image Placeholder */}
              <div className="flex items-center justify-center order-2 md:order-1">
                <div className="relative w-full h-[320px] bg-gradient-to-br from-[#3d2820]/50 to-[#1a1310]/50 rounded-lg flex items-center justify-center border border-[#e8dcc4]/20">
                  <div className="text-center space-y-4">
                    <div className="text-7xl">🕶️</div>
                    <p className="text-[#e8dcc4]/60 text-sm">Sale Collection</p>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="text-left md:text-right space-y-6 order-1 md:order-2">
                <div>
                  <h2 className="text-5xl md:text-7xl font-bold text-[#e8dcc4] leading-tight tracking-wide">
                    50% OFF
                  </h2>
                  <p className="text-2xl md:text-3xl text-[#e8dcc4] mt-4 tracking-wider">
                    SELECTED ITEMS
                  </p>
                </div>
                <div className="flex md:justify-end">
                  <button className="border-2 border-[#e8dcc4] text-[#e8dcc4] px-8 py-4 text-lg font-semibold tracking-wider hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300 rounded">
                    SHOP SALE
                  </button>
                </div>
              </div>
            </div>
          </section>
        </Link>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-24 py-12 border-t border-[#e8dcc4]/20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#e8dcc4] tracking-wider">
              AGOSTINO OCULIST
            </h2>
          </div>
          <nav className="flex flex-wrap gap-6 md:gap-8 justify-center">
            <a
              href="#privacy"
              className="text-[#e8dcc4] hover:text-white transition-colors text-sm tracking-wide"
            >
              PRIVACY POLICY
            </a>
            <a
              href="#terms"
              className="text-[#e8dcc4] hover:text-white transition-colors text-sm tracking-wide"
            >
              TERMS OF SERVICE
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
