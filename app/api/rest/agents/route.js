import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined;
    const name = searchParams.get('name');
    const rarity = searchParams.get('rarity');
    const team = searchParams.get('team');

    // Le as informações do arquivo JSON
    const filePath = path.join(process.cwd(), 'hooks', 'agents.json');
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return NextResponse.json(
        { error: 'Agents data file not found', path: filePath },
        { status: 404 }
      );
    }

    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    let agents = JSON.parse(fileContents);

    if (name) {
      agents = agents.filter((agent) => agent.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (rarity) {
      agents = agents.filter(
        (agent) =>
          agent.rarity &&
          agent.rarity.name &&
          agent.rarity.name.toLowerCase() === rarity.toLowerCase()
      );
    }

    if (team) {
      agents = agents.filter(
        (agent) =>
          agent.team &&
          agent.team.name &&
          agent.team.name.toLowerCase().includes(team.toLowerCase())
      );
    }

    if (limit && limit > 0) {
      agents = agents.slice(0, limit);
    }

    return NextResponse.json({
      count: agents.length,
      data: agents,
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents', details: error.message },
      { status: 500 }
    );
  }
}
