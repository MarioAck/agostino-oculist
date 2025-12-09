import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="flex justify-end mb-4">
          <Link href="/admin" className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors text-sm">
            Admin Panel
          </Link>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Agostino Oculist
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover Our Premium Eyewear Collection
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/best-sellers">
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
              <div className="p-8 h-64 flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Best Sellers
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Our most popular eyewear choices
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>

          <Link href="/new-sale">
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
              <div className="p-8 h-64 flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🔥</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  New Sale
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Latest deals and special offers
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
