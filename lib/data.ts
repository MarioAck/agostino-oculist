import fs from 'fs';
import path from 'path';

export interface Item {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
  image: string;
  category: 'best-seller' | 'sale';
}

export interface ItemsData {
  bestSellers: Item[];
  saleItems: Item[];
}

const dataFilePath = path.join(process.cwd(), 'data', 'items.json');

export function readItemsData(): ItemsData {
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read items data:', error);
    // Return default empty data if file doesn't exist
    return {
      bestSellers: [],
      saleItems: []
    };
  }
}

export function writeItemsData(data: ItemsData): void {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}
