import Link from "next/link";

async function getBestSellers() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/items`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.bestSellers || [];
}

export default async function BestSellers() {
  const bestSellers = await getBestSellers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Home
          </Link>
          <Link href="/admin" className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors">
            Admin Panel
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🏆 Best Sellers
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Our customers' favorite eyewear selections
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {bestSellers.map((item: any) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-4 flex items-center justify-center text-6xl">
                {item.image}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {item.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${item.price}
                </span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors duration-200">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
