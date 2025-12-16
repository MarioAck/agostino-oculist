import { NextResponse } from 'next/server';
import { readItemsData, writeItemsData } from '@/lib/data';

// Normalize item to ensure it has both image and images fields
function normalizeItem(item: any) {
  // If images array exists and has items, use it
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    item.image = item.images[0]; // Set image to first in array for backward compatibility
  } else if (item.image) {
    // If only image exists (old data), create images array
    item.images = [item.image];
  } else {
    // Fallback to empty array
    item.images = [];
  }
  return item;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    console.log('[API] GET /api/items - Reading items data...');
    const data = readItemsData();
    console.log('[API] Data read successfully:', {
      bestSellersCount: data.bestSellers?.length || 0,
      saleItemsCount: data.saleItems?.length || 0
    });

    // Normalize all items to ensure they have images array
    data.bestSellers = data.bestSellers.map(normalizeItem);
    data.saleItems = data.saleItems.map(normalizeItem);

    // If category filter is specified, return only that category
    if (category === 'best-seller') {
      console.log('[API] Filtering for best-seller category');
      return NextResponse.json(data.bestSellers);
    } else if (category === 'sale') {
      console.log('[API] Filtering for sale category');
      return NextResponse.json(data.saleItems);
    }

    // Otherwise return full data
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Failed to read data:', error);
    return NextResponse.json({
      error: 'Failed to read data',
      details: error instanceof Error ? error.message : 'Unknown error',
      bestSellers: [],
      saleItems: []
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newItem = await request.json();
    const data = readItemsData();

    // Normalize the new item to ensure it has both image and images fields
    const normalizedItem = normalizeItem(newItem);

    // Validate that at least one image exists
    if (!normalizedItem.images || normalizedItem.images.length === 0) {
      return NextResponse.json({
        error: 'At least one image is required',
      }, { status: 400 });
    }

    // Add to appropriate array based on category
    if (normalizedItem.category === 'best-seller') {
      data.bestSellers.push(normalizedItem);
    } else if (normalizedItem.category === 'sale') {
      data.saleItems.push(normalizedItem);
    }

    writeItemsData(data);
    return NextResponse.json({ success: true, item: normalizedItem });
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

    // Normalize the updated item to ensure it has both image and images fields
    const normalizedItem = normalizeItem(updatedItem);

    // Validate that at least one image exists
    if (!normalizedItem.images || normalizedItem.images.length === 0) {
      return NextResponse.json({
        error: 'At least one image is required',
      }, { status: 400 });
    }

    // Find and update in appropriate array
    const bestSellerIndex = data.bestSellers.findIndex((item: any) => item.id === normalizedItem.id);
    const saleItemIndex = data.saleItems.findIndex((item: any) => item.id === normalizedItem.id);

    if (bestSellerIndex !== -1) {
      // If category changed, move to other array
      if (normalizedItem.category === 'sale') {
        data.bestSellers.splice(bestSellerIndex, 1);
        data.saleItems.push(normalizedItem);
      } else {
        data.bestSellers[bestSellerIndex] = normalizedItem;
      }
    } else if (saleItemIndex !== -1) {
      // If category changed, move to other array
      if (normalizedItem.category === 'best-seller') {
        data.saleItems.splice(saleItemIndex, 1);
        data.bestSellers.push(normalizedItem);
      } else {
        data.saleItems[saleItemIndex] = normalizedItem;
      }
    } else {
      // Item not found
      return NextResponse.json({
        error: 'Item not found',
      }, { status: 404 });
    }

    writeItemsData(data);
    return NextResponse.json({ success: true, item: normalizedItem });
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
