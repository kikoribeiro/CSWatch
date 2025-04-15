'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, TrendingUp, History, Share2 } from 'lucide-react';

// GraphQL query para buscar detalhes de uma skin específica
const GET_SKIN_DETAILS = gql`
  query GetSkinDetails($id: ID!) {
    skin(id: $id) {
      id
      name
      description
      image
      price
      rarity {
        name
        color
      }
      category
      collection
    }
  }
`;

// Query para buscar todas as skins para a lista de seleção
const GET_ALL_SKINS = gql`
  query {
    skins {
      id
      name
      image
    }
  }
`;

export default function SkinsQLComponent() {
  const [selectedSkinId, setSelectedSkinId] = useState(null);
  const [allSkins, setAllSkins] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const { loading: loadingAll, error: errorAll, data: allSkinsData } = useQuery(GET_ALL_SKINS);

  useEffect(() => {
    if (allSkinsData && allSkinsData.skins) {
      setAllSkins(allSkinsData.skins);
      if (allSkinsData.skins.length > 0 && !selectedSkinId) {
        setSelectedSkinId(allSkinsData.skins[0].id);
      }
    }
  }, [allSkinsData, selectedSkinId]);

  // Verifica se a skin selecionada está nos favoritos
  useEffect(() => {
    const checkFavorites = () => {
      if (!selectedSkinId) return;
      const favorites = JSON.parse(localStorage.getItem('favoriteSkins') || '[]');
      setIsFavorite(favorites.includes(selectedSkinId));
    };

    checkFavorites();
  }, [selectedSkinId]);

  // Query para buscar detalhes da skin selecionada
  const { loading, error, data } = useQuery(GET_SKIN_DETAILS, {
    variables: { id: selectedSkinId },
    skip: !selectedSkinId,
  });

  const handleSkinSelect = (e) => {
    setSelectedSkinId(e.target.value);
  };

  const toggleFavorite = () => {
    if (!selectedSkinId) return;

    const favorites = JSON.parse(localStorage.getItem('favoriteSkins') || '[]');

    if (isFavorite) {
      const newFavorites = favorites.filter((id) => id !== selectedSkinId);
      localStorage.setItem('favoriteSkins', JSON.stringify(newFavorites));
    } else {
      favorites.push(selectedSkinId);
      localStorage.setItem('favoriteSkins', JSON.stringify(favorites));
    }

    setIsFavorite(!isFavorite);
  };

  const getRarityColor = (rarity) => {
    if (!rarity) return 'bg-gray-500';

    // Se tivermos a cor diretamente do objeto rarity
    if (rarity.color) {
      return `bg-[${rarity.color}]`;
    }

    // Caso contrário, usar o mapeamento por nome
    switch (rarity.name) {
      case 'Consumer Grade':
        return 'bg-gray-400';
      case 'Industrial Grade':
        return 'bg-blue-400';
      case 'Mil-Spec':
        return 'bg-blue-600';
      case 'Restricted':
        return 'bg-purple-500';
      case 'Classified':
        return 'bg-pink-500';
      case 'Covert':
        return 'bg-red-500';
      case 'Contraband':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-[#0f1015] dark:bg-[#0f1015]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link
            href="/skins"
            className="flex items-center text-blue-500 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para Todas as Skins
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center text-white">
          Detalhes da Skin - GraphQL
        </h1>

        <div className="mb-6">
          <label htmlFor="skinSelector" className="block mb-2 text-white">
            Selecione uma skin:
          </label>
          <select
            id="skinSelector"
            className="bg-[#1a1b23] text-white p-2 rounded w-full border border-[#2a2b36] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            onChange={handleSkinSelect}
            value={selectedSkinId || ''}
          >
            {loadingAll && <option>Carregando skins...</option>}
            {errorAll && <option>Erro ao carregar skins</option>}
            {allSkins.map((skin) => (
              <option key={skin.id} value={skin.id}>
                {skin.name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="bg-[#1a1b23] rounded-lg p-6 shadow-lg border border-[#2a2b36]">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <Skeleton className="h-[300px] w-full rounded-lg bg-[#2a2b36]" />
              </div>
              <div className="md:w-1/2">
                <Skeleton className="h-8 w-3/4 mb-4 bg-[#2a2b36]" />
                <Skeleton className="h-4 w-full mb-2 bg-[#2a2b36]" />
                <Skeleton className="h-4 w-full mb-2 bg-[#2a2b36]" />
                <Skeleton className="h-4 w-full mb-2 bg-[#2a2b36]" />
                <Skeleton className="h-4 w-full mb-2 bg-[#2a2b36]" />
                <Skeleton className="h-4 w-full mb-2 bg-[#2a2b36]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 bg-red-900/20 p-4 rounded-lg border border-red-900">
            <p className="text-lg font-semibold">Erro ao carregar detalhes</p>
            <p>{error.message}</p>
          </div>
        )}

        {data && data.skin && (
          <div className="bg-[#1a1b23] rounded-lg p-6 shadow-lg border border-[#2a2b36]">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2 flex justify-center relative">
                <div className="relative w-full h-[300px] bg-[#0f1015] rounded-lg p-4">
                  {data.skin.image && (
                    <Image
                      src={data.skin.image}
                      alt={data.skin.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="rounded-lg"
                      priority
                    />
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFavorite}
                  className={`absolute top-2 right-2 ${isFavorite ? 'text-yellow-400' : 'text-gray-400'} hover:bg-[#2a2b36]`}
                  title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Star className={`h-5 w-5 ${isFavorite ? 'fill-yellow-400' : ''}`} />
                </Button>
              </div>

              <div className="md:w-1/2 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{data.skin.name}</h2>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: data.skin.rarity?.color
                        ? `${data.skin.rarity.color}20`
                        : undefined,
                      color: data.skin.rarity?.color || 'white',
                      borderColor: data.skin.rarity?.color || undefined,
                    }}
                    className="px-3 py-1"
                  >
                    {data.skin.rarity?.name || 'Standard'}
                  </Badge>
                </div>

                <p className="text-gray-300 mb-4">
                  {data.skin.description || 'Nenhuma descrição disponível'}
                </p>

                <Separator className="my-4 bg-[#2a2b36]" />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Preço:</span>
                    <span className="font-bold text-green-500">
                      {data.skin.price ? formatPrice(data.skin.price) : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold">Categoria:</span>
                    <span>{data.skin.category || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold">Coleção:</span>
                    <span>{data.skin.collection || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link href="/skins">
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              Voltar para Todas as Skins
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
