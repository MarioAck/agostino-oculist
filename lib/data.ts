import fs from "fs";
import path from "path";

export interface Item {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
  image: string;
  category: "best-seller" | "sale";
}

export interface ItemsData {
  saleItems: Item[];
  bestSellers: Item[];
}

const dataFilePath = path.join(process.cwd(), "data", "items.json");

export function readItemsData(): ItemsData {
  try {
    const fileContents = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Failed to read items data:", error);
    // Return empty arrays if file doesn't exist or can't be read
    return { bestSellers: [], saleItems: [] };
  }
}

export function writeItemsData(data: ItemsData): void {
  try {
    // Ensure directory exists
    const dataDir = path.dirname(dataFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    console.log("Successfully wrote items data");
  } catch (error) {
    console.error("Failed to write items data:", error);
    throw error;
  }
}
