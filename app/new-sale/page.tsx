import Link from "next/link";
import { readItemsData } from "@/lib/data";

async function getSaleItems() {
  const data = readItemsData();
  return data.saleItems;
}

export default async function NewSale() {
  const saleItems = await getSaleItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="text-red-600 dark:text-red-400 hover:underline"
          >
            ← Back to Home
          </Link>
          <Link
            href="/admin"
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Admin Panel
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🔥 New Sale
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Limited time offers on premium eyewear
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {saleItems.map((item: any) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative aspect-square bg-gradient-to-br from-red-100 to-orange-200 dark:from-gray-700 dark:to-gray-600">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {item.discount}% OFF
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {item.description}
                </p>
                <div className="mb-4">
                  <span className="text-lg text-gray-500 dark:text-gray-400 line-through mr-2">
                    ${item.originalPrice}
                  </span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ${item.price}
                  </span>
                </div>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors duration-200 font-semibold">
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
