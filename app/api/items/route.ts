import { NextResponse } from 'next/server';
import { readItemsData, writeItemsData } from '@/lib/data';

export async function GET() {
  try {
    const data = readItemsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to read data:', error);
    return NextResponse.json({
      error: 'Failed to read data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newItem = await request.json();
    const data = readItemsData();

    if (newItem.category === 'best-seller') {
      data.bestSellers.push(newItem);
    } else if (newItem.category === 'sale') {
      data.saleItems.push(newItem);
    }

    writeItemsData(data);
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
    const data = readItemsData();

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

    writeItemsData(data);
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

    const data = readItemsData();

    if (category === 'best-seller') {
      data.bestSellers = data.bestSellers.filter((item: any) => item.id !== id);
    } else if (category === 'sale') {
      data.saleItems = data.saleItems.filter((item: any) => item.id !== id);
    }

    writeItemsData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({
      error: 'Failed to delete item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
