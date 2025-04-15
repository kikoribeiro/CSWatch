import { createSchema, createYoga } from 'graphql-yoga';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Função para ler o arquivo skins.json
function readSkinsData() {
  try {
    const filePath = path.join(process.cwd(), 'hooks', 'skins.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading skins.json:', error);
    return [];
  }
}

const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Rarity {
      name: String
      color: String
    }

    type Skin {
      id: ID!
      name: String!
      description: String
      category: String
      rarity: Rarity
      price: Float
      image: String
      type: String
      collection: String
    }

    type Query {
      skins(category: String, rarityName: String, search: String, limit: Int, offset: Int): [Skin!]!

      skin(id: ID!): Skin

      skinCount(category: String, rarityName: String, search: String): Int!
    }
  `,
  resolvers: {
    Query: {
      skins: async (_, args) => {
        try {
          const { category, rarityName, search, limit = 20, offset = 0 } = args;
          let skins = readSkinsData();

          // Aplicar filtros
          if (category) {
            skins = skins.filter((skin) => skin.category === category);
          }

          if (rarityName) {
            skins = skins.filter((skin) => skin.rarity && skin.rarity.name === rarityName);
          }

          if (search) {
            const searchLower = search.toLowerCase();
            skins = skins.filter(
              (skin) =>
                skin.name.toLowerCase().includes(searchLower) ||
                (skin.description && skin.description.toLowerCase().includes(searchLower))
            );
          }

          // Aplicar paginação
          return skins.slice(offset, offset + limit);
        } catch (error) {
          console.error('Error fetching skins:', error);
          throw new Error('Failed to fetch skins');
        }
      },

      skin: async (_, { id }) => {
        try {
          const skins = readSkinsData();
          return skins.find((skin) => skin.id === id);
        } catch (error) {
          console.error('Error fetching skin by ID:', error);
          throw new Error('Failed to fetch skin');
        }
      },

      skinCount: async (_, args) => {
        try {
          const { category, rarityName, search } = args;
          let skins = readSkinsData();

          // Aplicar filtros
          if (category) {
            skins = skins.filter((skin) => skin.category === category);
          }

          if (rarityName) {
            skins = skins.filter((skin) => skin.rarity && skin.rarity.name === rarityName);
          }

          if (search) {
            const searchLower = search.toLowerCase();
            skins = skins.filter(
              (skin) =>
                skin.name.toLowerCase().includes(searchLower) ||
                (skin.description && skin.description.toLowerCase().includes(searchLower))
            );
          }

          return skins.length;
        } catch (error) {
          console.error('Error counting skins:', error);
          throw new Error('Failed to count skins');
        }
      },
    },
  },
});

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response: NextResponse },
});

export { handleRequest as GET, handleRequest as POST };
