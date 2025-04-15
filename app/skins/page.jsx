'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SkinsPage() {
  // Estados para gerir os dados e a interatividade da página
  const [skins, setSkins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Opções de raridade para o filtro de dropdown
  const rarityOptions = [
    { id: 'all', name: 'Todas as Raridades' },
    { id: 'Restricted', name: 'Restricted' },
    { id: 'Classified', name: 'Classified' },
    { id: 'Covert', name: 'Covert' },
    { id: 'Contraband', name: 'Contraband' },
  ];

  // Opções de categoria para o filtro de dropdown
  const categoryOptions = [
    { id: 'all', name: 'Todas as Categorias' },
    { id: 'Normal', name: 'Normal' },
    { id: 'StatTrak™', name: 'StatTrak™' },
    { id: 'Souvenir', name: 'Souvenir' },
    { id: '★', name: '★ (Faca)' },
    { id: '★ StatTrak™', name: '★ StatTrak™' },
  ];

  // Hook de efeito para carregar os dados quando a página carrega ou os filtros mudam
  useEffect(() => {
    async function fetchSkins() {
      try {
        setLoading(true);
        setError(null);

        // Constrói o URL da API com parâmetros da consulta baseada nos filtros
        let apiUrl = '/api/rest/skins';
        const params = new URLSearchParams();

        // Adiciona parâmetros de filtro se existirem
        if (searchQuery) params.append('name', searchQuery);
        if (selectedRarity && selectedRarity !== 'all') params.append('rarity', selectedRarity);
        if (selectedCategory && selectedCategory !== 'all')
          params.append('category', selectedCategory);

        const queryString = params.toString();
        if (queryString) {
          apiUrl += `?${queryString}`;
        }

        // Faz a chamada à API
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch skins: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API response:', data);

        // Verifica erros
        if (data && data.error) {
          throw new Error(data.error);
        }

        // Processa os dados recebidos
        if (data && Array.isArray(data.data)) {
          setSkins(data.data);
        } else if (data && Array.isArray(data)) {
          setSkins(data);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching skins:', err);
        setError(err.message);
        setSkins([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSkins();
  }, [searchQuery, selectedRarity, selectedCategory]); // Dependências que acionam o recarregamento

  // Filtra as skins baseada na pesquisa
  const filteredSkins = Array.isArray(skins)
    ? skins.filter(
        (skin) => skin && skin.name && skin.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Funções para lidar com mudanças nos filtros de dropdown
  const handleRarityChange = (value) => {
    setSelectedRarity(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">CS2 Skins</h1>
        <Separator className="my-4" />
        {/*Secção de filtros */}
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Procura skins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedRarity} onValueChange={handleRarityChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Raridade" />
            </SelectTrigger>
            <SelectContent>
              {rarityOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Secção de loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Card key={`skeleton-${index}`}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Secção de skins */}
        {!loading && !error && filteredSkins.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredSkins.map((skin, index) => (
              <Card
                key={skin.id || `skin-${index}`}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 bg-accent">
                  {skin.image && (
                    <Image
                      src={skin.image}
                      alt={skin.name || 'Skin sem nome'}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2 line-clamp-2">
                    {skin.name || 'Skin sem nome'}
                  </h3>

                  <div className="flex items-center justify-between mt-2">
                    {skin.rarity && skin.rarity.name && (
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: skin.rarity.color ? `${skin.rarity.color}15` : undefined,
                          color: skin.rarity.color || undefined,
                          borderColor: skin.rarity.color || undefined,
                        }}
                      >
                        {skin.rarity.name}
                      </Badge>
                    )}

                    {typeof skin.price === 'number' && (
                      <span className="text-sm text-muted-foreground">
                        ${skin.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {filteredSkins.length === 0 && !loading && !error && (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg">
              Nenhuma skin encontrada com essa pesquisa.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
