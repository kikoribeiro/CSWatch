// lib/apollo-client.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

let client;

function getClient() {
  // Em execução no servidor
  if (typeof window === 'undefined') {
    return new ApolloClient({
      ssrMode: true,
      link: new HttpLink({
        uri: '/api/graphql',
      }),
      cache: new InMemoryCache(),
    });
  }

  // Reutiliza o cliente no navegador
  if (!client) {
    client = new ApolloClient({
      link: new HttpLink({
        uri: '/api/graphql',
      }),
      cache: new InMemoryCache(),
    });
  }

  return client;
}

export default getClient();
