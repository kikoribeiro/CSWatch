import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
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

    // Le as informações do arquivo JSON
    const filePath = path.join(process.cwd(), 'hooks', 'skins.json');

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return NextResponse.json(
        { error: 'Skins data file not found', path: filePath },
        { status: 404 }
      );
    }

    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    let skins;

    try {
      skins = JSON.parse(fileContents);
      // Verifica se os dados são um array
      if (!Array.isArray(skins)) {
        console.error('Skins data is not an array');
        return NextResponse.json(
          { error: 'Invalid skins data format', details: 'Data is not an array' },
          { status: 500 }
        );
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in skins data file', details: parseError.message },
        { status: 500 }
      );
    }

    if (name) {
      skins = skins.filter(
        (skin) => skin.name && skin.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (rarity) {
      skins = skins.filter(
        (skin) =>
          skin.rarity && skin.rarity.name && skin.rarity.name.toLowerCase() === rarity.toLowerCase()
      );
    }

    if (minPrice !== undefined) {
      skins = skins.filter((skin) => skin.price && skin.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      skins = skins.filter((skin) => skin.price && skin.price <= maxPrice);
    }

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

export async function POST(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Skin ID is required' }, { status: 400 });
    }

    // Le as skins do arquivo JSON
    const filePath = path.join(process.cwd(), 'hooks', 'skins.json');
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    const skins = JSON.parse(fileContents);

    // Encontra a skin pelo ID
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
