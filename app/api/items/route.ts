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

    // Add to appropriate array based on category
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

    // Find and update in appropriate array
    const bestSellerIndex = data.bestSellers.findIndex((item: any) => item.id === updatedItem.id);
    const saleItemIndex = data.saleItems.findIndex((item: any) => item.id === updatedItem.id);

    if (bestSellerIndex !== -1) {
      // If category changed, move to other array
      if (updatedItem.category === 'sale') {
        data.bestSellers.splice(bestSellerIndex, 1);
        data.saleItems.push(updatedItem);
      } else {
        data.bestSellers[bestSellerIndex] = updatedItem;
      }
    } else if (saleItemIndex !== -1) {
      // If category changed, move to other array
      if (updatedItem.category === 'best-seller') {
        data.saleItems.splice(saleItemIndex, 1);
        data.bestSellers.push(updatedItem);
      } else {
        data.saleItems[saleItemIndex] = updatedItem;
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

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const data = readItemsData();
    // Filter from both arrays
    data.bestSellers = data.bestSellers.filter((item: any) => item.id !== id);
    data.saleItems = data.saleItems.filter((item: any) => item.id !== id);

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
