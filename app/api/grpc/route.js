import { NextResponse } from 'next/server';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

// Função para ler o arquivo de skins.json
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

  return skins;
}

// Função para converter dados do skins.json para o formato usado pelo gRPC
async function loadRealSkinData() {
  try {
    const skins = await readSkinsFile();
    const skinsPriceData = {};

    skins.forEach((skin) => {
      skinsPriceData[skin.id] = {
        id: skin.id,
        name: skin.name,
        currentPrice: skin.price,
        history: generateRandomPriceHistory(skin.price, 30), // historico de preços aleatório
        description: skin.description,
        category: skin.category,
        rarity: skin.rarity,
        image: skin.image,
      };
    });

    return skinsPriceData;
  } catch (error) {
    console.error('Erro ao carregar dados reais de skins:', error);
    // Fallback para dados simulados em caso de erro
    return {
      ak47_asiimov: {
        id: 'ak47_asiimov',
        name: 'AK-47 | Asiimov',
        currentPrice: 35.75,
        history: generateRandomPriceHistory(35.75, 30),
      },
    };
  }
}

// Configuração para o servidor HTTP e gRPC
const server = createServer();
const grpcServer = new grpc.Server();

// Caminho para o arquivo proto
const PROTO_PATH = path.join(process.cwd(), 'proto', 'skins_price.proto');

// Verifica se o arquivo proto existe
if (!fs.existsSync(PROTO_PATH)) {
  console.error('Arquivo proto não encontrado:', PROTO_PATH);
  fs.mkdirSync(path.join(process.cwd(), 'proto'), { recursive: true });

  // Criar o arquivo proto se não existir
  const protoContent = `
syntax = "proto3";

package skins;

service SkinsPrice {
  // Stream de atualizações de preços
  rpc SubscribeToPriceUpdates (PriceSubscriptionRequest) returns (stream PriceUpdate);
  
  // Obter histórico de preços
  rpc GetPriceHistory (PriceHistoryRequest) returns (PriceHistoryResponse);
}

message PriceSubscriptionRequest {
  repeated string skin_ids = 1; // IDs das skins para monitorar
}

message PriceUpdate {
  string skin_id = 1;
  string skin_name = 2;
  double price = 3;
  string timestamp = 4;
  double change_percentage = 5; // Mudança percentual desde a última atualização
}

message PriceHistoryRequest {
  string skin_id = 1;
  string time_range = 2; // "day", "week", "month", "year"
}

message PricePoint {
  double price = 1;
  string timestamp = 2;
}

message PriceHistoryResponse {
  string skin_id = 1;
  string skin_name = 2;
  repeated PricePoint price_points = 3;
}
  `;

  fs.writeFileSync(PROTO_PATH, protoContent);
  console.log('Arquivo proto criado em:', PROTO_PATH);
}

// Carregar as definições do proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const skinsPriceService = protoDescriptor.skins;

// Função para gerar histórico de preços aleatórios
function generateRandomPriceHistory(basePrice, days) {
  const history = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Variação de preço entre -5% e +5%
    const randomVariation = Math.random() * 0.1 - 0.05;
    const price = basePrice * (1 + randomVariation);

    history.push({
      price: price.toFixed(2),
      timestamp: date.toISOString(),
    });
  }

  // Ordenar por data (mais antiga para mais recente)
  return history.reverse();
}

// Variável para armazenar os dados de skins
let skinsPriceData = {};

// Implementar o serviço gRPC
const SkinsPrice = {
  // Stream de atualizações de preços em tempo real
  SubscribeToPriceUpdates: (call) => {
    const skinIds = call.request.skin_ids;
    let intervalIds = [];

    // Enviar preços iniciais imediatamente
    if (skinIds && skinIds.length > 0) {
      skinIds.forEach((skinId) => {
        const skinData = skinsPriceData[skinId];
        if (skinData) {
          call.write({
            skin_id: skinId,
            skin_name: skinData.name,
            price: skinData.currentPrice,
            timestamp: new Date().toISOString(),
            change_percentage: 0,
          });
        }
      });
    } else {
      // Se nenhum ID específico for fornecido, enviar todos
      Object.values(skinsPriceData).forEach((skinData) => {
        call.write({
          skin_id: skinData.id,
          skin_name: skinData.name,
          price: skinData.currentPrice,
          timestamp: new Date().toISOString(),
          change_percentage: 0,
        });
      });
    }

    // Simular atualizações de preço a cada 30 segundos
    const intervalId = setInterval(() => {
      const skinsToUpdate =
        skinIds.length > 0
          ? skinIds.map((id) => skinsPriceData[id]).filter(Boolean)
          : Object.values(skinsPriceData);

      skinsToUpdate.forEach((skinData) => {
        // Simular mudança de preço
        const previousPrice = skinData.currentPrice;
        const changePercentage = (Math.random() * 4 - 2) * 0.01; // -2% a +2%
        skinData.currentPrice = previousPrice * (1 + changePercentage);

        // Calcular a mudança percentual
        const percentChange = ((skinData.currentPrice - previousPrice) / previousPrice) * 100;

        // Adicionar ao histórico
        skinData.history.push({
          price: skinData.currentPrice,
          timestamp: new Date().toISOString(),
        });

        // Enviar atualização
        call.write({
          skin_id: skinData.id,
          skin_name: skinData.name,
          price: skinData.currentPrice,
          timestamp: new Date().toISOString(),
          change_percentage: percentChange,
        });
      });
    }, 30000);

    intervalIds.push(intervalId);

    // Limpar os intervalos quando a conexão for encerrada
    call.on('cancelled', () => {
      intervalIds.forEach((id) => clearInterval(id));
    });

    call.on('error', () => {
      intervalIds.forEach((id) => clearInterval(id));
    });
  },

  // Obter histórico de preços
  GetPriceHistory: (call, callback) => {
    const { skin_id, time_range } = call.request;
    const skinData = skinsPriceData[skin_id];

    if (!skinData) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: `Skin with ID ${skin_id} not found`,
      });
    }

    // Determinar quantos dias retornar com base no time_range
    let daysToReturn = 7; 

    switch (time_range) {
      case 'day':
        daysToReturn = 1;
        break;
      case 'week':
        daysToReturn = 7;
        break;
      case 'month':
        daysToReturn = 30;
        break;
      case 'year':
        daysToReturn = 365;
        break;
    }

    // Limitar ao histórico disponível
    const pricePoints = skinData.history.slice(-daysToReturn);

    callback(null, {
      skin_id: skinData.id,
      skin_name: skinData.name,
      price_points: pricePoints,
    });
  },
};

// Adicionar o serviço ao servidor gRPC
grpcServer.addService(skinsPriceService.SkinsPrice.service, SkinsPrice);

// Porta para o gRPC server
const GRPC_PORT = process.env.GRPC_PORT || 50051;

// Inicializar os dados e iniciar o servidor
async function initializeAndStartServer() {
  try {
    // Carregar dados reais do arquivo skins.json
    skinsPriceData = await loadRealSkinData();

    // Iniciar o servidor gRPC
    grpcServer.bindAsync(
      `0.0.0.0:${GRPC_PORT}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          console.error('Falha ao iniciar servidor gRPC:', err);
          return;
        }
        console.log(`Servidor gRPC rodando na porta ${port}`);
        grpcServer.start();
      }
    );
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
  }
}

// Iniciar o servidor
initializeAndStartServer();

// Tratamento para a API Next.js
export async function GET(request) {
  try {
    // Recarregar os dados a cada requisição para garantir que estejam atualizados
    if (Object.keys(skinsPriceData).length === 0) {
      skinsPriceData = await loadRealSkinData();
    }

    return NextResponse.json({
      status: 'gRPC server running',
      port: GRPC_PORT,
      availableSkins: Object.entries(skinsPriceData).map(([id, data]) => ({
        id: id,
        name: data.name,
      })),
      endpoints: [
        {
          name: 'SubscribeToPriceUpdates',
          description: 'Subscrever a atualizações de preços em tempo real',
        },
        {
          name: 'GetPriceHistory',
          description: 'Obter histórico de preços de uma skin',
        },
      ],
    });
  } catch (error) {
    console.error('Erro na API gRPC:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Recarregar os dados a cada requisição para garantir que estejam atualizados
    if (Object.keys(skinsPriceData).length === 0) {
      skinsPriceData = await loadRealSkinData();
    }

    const data = await request.json();
    const { method, params } = data;

    if (method === 'GetPriceHistory') {
      const { skin_id, time_range } = params;
      const skinData = skinsPriceData[skin_id];

      if (!skinData) {
        return NextResponse.json({ error: 'Skin não encontrada' }, { status: 404 });
      }

      // Determinar quantos dias retornar
      let daysToReturn = 7; 

      switch (time_range) {
        case 'day':
          daysToReturn = 1;
          break;
        case 'week':
          daysToReturn = 7;
          break;
        case 'month':
          daysToReturn = 30;
          break;
        case 'year':
          daysToReturn = 365;
          break;
      }

      // Limitar ao histórico disponível
      const pricePoints = skinData.history.slice(-daysToReturn);

      return NextResponse.json({
        skin_id: skinData.id,
        skin_name: skinData.name,
        price_points: pricePoints,
      });
    }

    return NextResponse.json({ error: 'Método não suportado via HTTP' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API gRPC (POST):', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// GraphQL endpoint
export async function graphqlEndpoint(request) {
  const query = request.query.query;
  if (query === '{skins{ id name price }}') {
    const skins = Object.values(skinsPriceData).map((skin) => ({
      id: skin.id,
      name: skin.name,
      price: skin.currentPrice,
    }));
    return NextResponse.json({ data: { skins } });
  }
  return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
}
