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

const defaultData: ItemsData = {
  bestSellers: [
    {
      id: 'bs1',
      name: 'Classic Aviator',
      price: 129,
      description: 'Timeless style for every occasion',
      image: '👓',
      category: 'best-seller'
    },
    {
      id: 'bs2',
      name: 'Modern Wayfarer',
      price: 149,
      description: 'Contemporary design meets comfort',
      image: '👓',
      category: 'best-seller'
    },
    {
      id: 'bs3',
      name: 'Round Vintage',
      price: 139,
      description: 'Retro elegance for the discerning eye',
      image: '👓',
      category: 'best-seller'
    }
  ],
  saleItems: [
    {
      id: 'sale1',
      name: 'Summer Shades',
      price: 99,
      originalPrice: 159,
      discount: 38,
      description: 'Perfect for sunny days',
      image: '🕶️',
      category: 'sale'
    },
    {
      id: 'sale2',
      name: 'Designer Collection',
      price: 149,
      originalPrice: 249,
      discount: 40,
      description: 'Luxury meets affordability',
      image: '🕶️',
      category: 'sale'
    }
  ]
};

function initializeDataFile(): void {
  try {
    const dataDir = path.dirname(dataFilePath);

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Created data directory:', dataDir);
    }

    // Create items.json with default data if it doesn't exist
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2));
      console.log('Initialized items.json with default data');
    }
  } catch (error) {
    console.error('Failed to initialize data file:', error);
  }
}

export function readItemsData(): ItemsData {
  try {
    // Initialize file if it doesn't exist
    initializeDataFile();

    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read items data:', error);
    // Return default data if file can't be read
    return defaultData;
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
    console.log('Successfully wrote items data');
  } catch (error) {
    console.error('Failed to write items data:', error);
    throw error;
  }
}
