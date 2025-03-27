import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    // URL parameters support
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined;
    const name = searchParams.get('name');
    const rarity = searchParams.get('rarity');
    const minPrice = searchParams.get('minPrice')
      ? parseFloat(searchParams.get('minPrice'))
      : undefined;
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice'))
      : undefined;

    // Read the skins data from the JSON file
    const filePath = path.join(process.cwd(), 'hooks', 'skins.json');
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    let skins = JSON.parse(fileContents);

    // Apply filters if they exist
    if (name) {
      skins = skins.filter((skin) => skin.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (rarity) {
      skins = skins.filter(
        (skin) =>
          skin.rarity && skin.rarity.name && skin.rarity.name.toLowerCase() === rarity.toLowerCase()
      );
    }

    if (minPrice !== undefined) {
      skins = skins.filter((skin) => skin.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      skins = skins.filter((skin) => skin.price <= maxPrice);
    }

    // Apply limit if specified
    if (limit && limit > 0) {
      skins = skins.slice(0, limit);
    }

    return NextResponse.json({
      count: skins.length,
      data: skins,
    });
  } catch (error) {
    console.error('Error fetching skins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skins', details: error.message },
      { status: 500 }
    );
  }
}

// Get a single skin by ID
export async function POST(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Skin ID is required' }, { status: 400 });
    }

    // Read the skins data
    const filePath = path.join(process.cwd(), 'hooks', 'skins.json');
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    const skins = JSON.parse(fileContents);

    // Find the skin with the matching ID
    const skin = skins.find((skin) => skin.id === id);

    if (!skin) {
      return NextResponse.json({ error: 'Skin not found' }, { status: 404 });
    }

    return NextResponse.json(skin);
  } catch (error) {
    console.error('Error fetching skin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skin', details: error.message },
      { status: 500 }
    );
  }
}
