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

    data.items.push(newItem);

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

    const index = data.items.findIndex((item: any) => item.id === updatedItem.id);
    if (index !== -1) {
      data.items[index] = updatedItem;
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
    data.items = data.items.filter((item: any) => item.id !== id);

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
