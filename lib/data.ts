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

function ensureDataFile(): void {
  try {
    // Ensure directory exists
    const dataDir = path.dirname(dataFilePath);
    if (!fs.existsSync(dataDir)) {
      console.log('[DATA] Creating data directory:', dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create file if it doesn't exist
    if (!fs.existsSync(dataFilePath)) {
      console.log('[DATA] Creating initial items.json file');
      const initialData: ItemsData = { bestSellers: [], saleItems: [] };
      fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
      console.log('[DATA] items.json created successfully');
    }
  } catch (error) {
    console.error('[DATA] Failed to ensure data file:', error);
    throw error;
  }
}

export function readItemsData(): ItemsData {
  try {
    // Ensure file exists
    ensureDataFile();

    const fileContents = fs.readFileSync(dataFilePath, "utf8");
    const parsedData = JSON.parse(fileContents);

    return parsedData;
  } catch (error) {
    console.error("[DATA] Failed to read items data:", error);
    // Return empty arrays if file doesn't exist or can't be read
    return { bestSellers: [], saleItems: [] };
  }
}

export function writeItemsData(data: ItemsData): void {
  try {
    // Ensure directory exists
    const dataDir = path.dirname(dataFilePath);
    if (!fs.existsSync(dataDir)) {
      console.log('[DATA] Creating data directory:', dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    console.log("Successfully wrote items data");
  } catch (error) {
    console.error("Failed to write items data:", error);
    throw error;
  }
}
