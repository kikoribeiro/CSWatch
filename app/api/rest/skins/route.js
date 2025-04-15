import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Função utilitária para ler o arquivo de skins
async function readSkinsFile() {
  const filePath = path.join(process.cwd(), 'hooks', 'skins.json');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }
  
  const fileContents = await fs.promises.readFile(filePath, 'utf8');
  const skins = JSON.parse(fileContents);
  
  if (!Array.isArray(skins)) {
    throw new Error('Skins data is not an array');
  }
  
  return { skins, filePath };
}

// Função utilitária para escrever no arquivo de skins
async function writeSkinsFile(skins, filePath) {
  await fs.promises.writeFile(filePath, JSON.stringify(skins, null, 2), 'utf8');
}

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
    const { skins } = await readSkinsFile();

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
    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is a required field' },
        { status: 400 }
      );
    }
    
    // Ler o arquivo atual de skins
    const { skins, filePath } = await readSkinsFile();
    
    // Criar nova skin com ID único
    const newSkin = {
      id: data.id || uuidv4(), // Usar o ID fornecido ou gerar um novo
      name: data.name,
      description: data.description || '',
      image: data.image || '',
      price: parseFloat(data.price) || 0,
      category: data.category || 'Normal',
      rarity: data.rarity || {
        id: 'Restricted',
        name: 'Restricted',
        color: '#0073ff'
      },
      createdAt: new Date().toISOString()
    };
    
    // Adicionar a nova skin à lista
    skins.push(newSkin);
    
    // Salvar a lista atualizada no arquivo
    await writeSkinsFile(skins, filePath);
    
    return NextResponse.json(newSkin, { status: 201 });
  } catch (error) {
    console.error('Error creating skin:', error);
    return NextResponse.json(
      { error: 'Failed to create skin', details: error.message },
      { status: 500 }
    );
  }
}
