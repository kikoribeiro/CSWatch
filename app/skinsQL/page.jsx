'use client';

export const dynamic = 'force-dynamic';

import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apollo-client';
import SkinsQLComponent from '@/components/skins-graphql'; // Componente que renderiza a lista de skins e detalhes


export default function SkinsQLPage() {
  return (
    <ApolloProvider client={client}>
      <SkinsQLComponent />
    </ApolloProvider>
  );
}
