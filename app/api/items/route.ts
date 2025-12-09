import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'items.json');

function readData() {
  const fileContents = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(fileContents);
}

function writeData(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to read data:', error);
    return NextResponse.json({
      error: 'Failed to read data',
      details: error instanceof Error ? error.message : 'Unknown error',
      path: dataFilePath
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newItem = await request.json();
    const data = readData();

    if (newItem.category === 'best-seller') {
      data.bestSellers.push(newItem);
    } else if (newItem.category === 'sale') {
      data.saleItems.push(newItem);
    }

    writeData(data);
    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Failed to add item:', error);
    return NextResponse.json({
      error: 'Failed to add item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedItem = await request.json();
    const data = readData();

    if (updatedItem.category === 'best-seller') {
      const index = data.bestSellers.findIndex((item: any) => item.id === updatedItem.id);
      if (index !== -1) {
        data.bestSellers[index] = updatedItem;
      }
    } else if (updatedItem.category === 'sale') {
      const index = data.saleItems.findIndex((item: any) => item.id === updatedItem.id);
      if (index !== -1) {
        data.saleItems[index] = updatedItem;
      }
    }

    writeData(data);
    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Failed to update item:', error);
    return NextResponse.json({
      error: 'Failed to update item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');

    if (!id || !category) {
      return NextResponse.json({ error: 'Missing id or category' }, { status: 400 });
    }

    const data = readData();

    if (category === 'best-seller') {
      data.bestSellers = data.bestSellers.filter((item: any) => item.id !== id);
    } else if (category === 'sale') {
      data.saleItems = data.saleItems.filter((item: any) => item.id !== id);
    }

    writeData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({
      error: 'Failed to delete item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
