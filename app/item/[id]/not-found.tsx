import Link from "next/link";

export default function NotFound() {
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
      <header className="relative z-10 w-full px-4 md:px-12 lg:px-24 py-6 md:py-8">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div>
            <Link href="/">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#e8dcc4] tracking-wider hover:text-[#f5ecd7] transition-colors">
                AGOSTINO OCULIST
              </h1>
            </Link>
          </div>
          <nav className="flex gap-3 md:gap-6">
            <Link href="/" className="text-[#e8dcc4] hover:text-white transition-colors font-medium tracking-wide text-xs md:text-sm lg:text-base">
              HOME
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-12 lg:px-24 py-6 md:py-12 flex-grow flex items-center justify-center">
        <div className="bg-gradient-to-br from-[#1a1310]/80 to-[#2d1810]/80 backdrop-blur-sm rounded-lg p-6 md:p-8 lg:p-12 border border-[#e8dcc4]/10 shadow-2xl text-center max-w-2xl w-full">
          <div className="mb-6 md:mb-8">
            <svg
              className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto text-[#e8dcc4]/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#e8dcc4] mb-4 md:mb-6 tracking-wide">
            ITEM NOT FOUND
          </h1>

          <p className="text-[#e8dcc4]/80 text-sm md:text-base lg:text-xl mb-6 md:mb-8 leading-relaxed">
            Sorry, we couldn't find the item you're looking for. It may have been removed or the link might be incorrect.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link
              href="/"
              className="border-2 border-[#e8dcc4] text-[#e8dcc4] px-6 py-2.5 md:px-8 md:py-3 rounded-lg font-bold text-base md:text-lg tracking-wider hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300 shadow-lg"
            >
              GO HOME
            </Link>
            <Link
              href="/best-sellers"
              className="border-2 border-[#e8dcc4]/50 text-[#e8dcc4]/80 px-6 py-2.5 md:px-8 md:py-3 rounded-lg font-bold text-base md:text-lg tracking-wider hover:border-[#e8dcc4] hover:text-[#e8dcc4] transition-all duration-300"
            >
              VIEW BEST SELLERS
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 md:px-12 lg:px-24 py-8 md:py-12 mt-8 md:mt-12 border-t border-[#e8dcc4]/20">
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
