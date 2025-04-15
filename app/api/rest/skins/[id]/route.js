import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Função utilitária para ler o arquivo de skins
async function readSkinsFile() {
  const filePath = path.join(process.cwd(), 'hooks', 'skins.json');
  console.log('Reading skins from path:', filePath);

  // Verificar se o diretório existe, se não, criá-lo
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }

  // Verificar se o arquivo existe, se não, criar um arquivo vazio com array
  if (!fs.existsSync(filePath)) {
    await fs.promises.writeFile(filePath, JSON.stringify([]), 'utf8');
    console.log(`Created empty skins file: ${filePath}`);
    return { skins: [], filePath };
  }

  const fileContents = await fs.promises.readFile(filePath, 'utf8');

  try {
    const skins = JSON.parse(fileContents);

    if (!Array.isArray(skins)) {
      console.warn('Skins file does not contain an array, initializing with empty array');
      await fs.promises.writeFile(filePath, JSON.stringify([]), 'utf8');
      return { skins: [], filePath };
    }

    return { skins, filePath };
  } catch (error) {
    console.error('Error parsing skins JSON:', error);
    await fs.promises.writeFile(filePath, JSON.stringify([]), 'utf8');
    return { skins: [], filePath };
  }
}

// Função utilitária para escrever no arquivo de skins
async function writeSkinsFile(skins, filePath) {
  console.log(`Writing ${skins.length} skins to file: ${filePath}`);
  return fs.promises.writeFile(filePath, JSON.stringify(skins, null, 2), 'utf8');
}

// GET para obter uma skin específica por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Ler todas as skins
    const { skins } = await readSkinsFile();

    // Encontrar a skin pelo ID
    const skin = skins.find((s) => s.id === id);

    if (!skin) {
      return NextResponse.json({ error: `Skin with ID ${id} not found` }, { status: 404 });
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

// PUT para atualizar uma skin existente
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    // Ler o arquivo atual de skins
    const { skins, filePath } = await readSkinsFile();

    // Encontrar o índice da skin
    const index = skins.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: `Skin with ID ${id} not found` }, { status: 404 });
    }

    // Criar skin atualizada preservando o ID e adicionando timestamp de atualização
    const updatedSkin = {
      ...skins[index],
      ...data,
      id, // Garantir que o ID não seja alterado
      updatedAt: new Date().toISOString(),
    };

    // Atualizar a skin no array
    skins[index] = updatedSkin;

    // Salvar a lista atualizada no arquivo
    await writeSkinsFile(skins, filePath);

    return NextResponse.json(updatedSkin);
  } catch (error) {
    console.error('Error updating skin:', error);
    return NextResponse.json(
      { error: 'Failed to update skin', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE para remover uma skin
export async function DELETE(request, { params }) {
  console.log('DELETE request received for skin ID:', params.id);

  try {
    const { id } = params;

    if (!id) {
      console.error('No ID provided in delete request');
      return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
    }

    // Ler o arquivo atual de skins
    const { skins, filePath } = await readSkinsFile();
    console.log(`Found ${skins.length} skins in file`);

    // Encontrar o índice da skin
    const index = skins.findIndex((s) => s.id === id);
    console.log(`Skin index in array: ${index}`);

    if (index === -1) {
      console.error(`Skin with ID ${id} not found`);
      return NextResponse.json({ error: 'Skin not found' }, { status: 404 });
    }

    // Armazenar a skin que será deletada para retornar
    const deletedSkin = skins[index];

    // Remover a skin do array
    skins.splice(index, 1);
    console.log(`Removed skin at index ${index}, new length: ${skins.length}`);

    // Salvar a lista atualizada no arquivo
    await writeSkinsFile(skins, filePath);

    console.log('Delete operation successful');
    return NextResponse.json({
      message: 'Skin deleted successfully',
      deletedSkin,
    });
  } catch (error) {
    console.error('Error deleting skin:', error);
    return NextResponse.json(
      { error: 'Failed to delete skin', details: error.message },
      { status: 500 }
    );
  }
}
