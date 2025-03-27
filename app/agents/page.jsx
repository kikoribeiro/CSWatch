'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';

// Import UI components from your components folder
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [error, setError] = useState(null);

  // Fetch agents from the API
  useEffect(() => {
    async function fetchAgents() {
      try {
        setLoading(true);
        let apiUrl = '/api/rest/agents';

        const params = new URLSearchParams();
        if (searchTerm) params.append('name', searchTerm);
        if (selectedRarity && selectedRarity !== 'all') params.append('rarity', selectedRarity);
        if (selectedTeam && selectedTeam !== 'all') params.append('team', selectedTeam);

        const queryString = params.toString();
        if (queryString) {
          apiUrl += `?${queryString}`;
        }

        console.log('Fetching agents from:', apiUrl); // Debug line

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setAgents(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError('Failed to load agents. Please try again later.');
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
  }, [searchTerm, selectedRarity, selectedTeam]);

  const rarityOptions = [
    { id: 'all', name: 'Todas as Raridades' },
    { id: 'Distinto', name: 'Distinto' },
    { id: 'Excecional', name: 'Excecional' },
    { id: 'Superior', name: 'Superior' },
    { id: 'Mestre', name: 'Mestre' },
  ];

  const teamOptions = [
    { id: 'all', name: 'Todas as Equipas' },
    { id: 'Terroristas', name: 'Terroristas' },
    { id: 'Contraterroristas', name: 'Contraterroristas' },
  ];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRarityChange = (value) => {
    setSelectedRarity(value);
  };

  const handleTeamChange = (value) => {
    setSelectedTeam(value);
  };

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">CS2 Agents</h1>

        <Separator className="my-4" />

        {/* Filters section */}
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Procura agentes..."
              value={searchTerm}
              onChange={handleSearchChange}
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

          <Select value={selectedTeam} onValueChange={handleTeamChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Equipa" />
            </SelectTrigger>
            <SelectContent>
              {teamOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={`skeleton-${index}`}>
                <Skeleton className="h-64 w-full" />
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

        {/* Error message */}
        {error && !loading && (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="p-4">
              <p className="text-destructive font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* No results */}
        {!loading && !error && agents.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg">Nenhum agente encontrado</p>
          </div>
        )}

        {/* Agents grid */}
        {!loading && !error && agents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-64 bg-accent">
                  {agent.image && (
                    <Image
                      src={agent.image}
                      alt={agent.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2 line-clamp-2">
                    {agent.name ? agent.name.replace(/\\\"/g, '"') : 'Agent desconhecido'}
                  </h3>

                  <div className="flex items-center justify-between mt-2">
                    {agent.rarity && (
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${agent.rarity.color}15`,
                          color: agent.rarity.color,
                          borderColor: agent.rarity.color,
                        }}
                      >
                        {agent.rarity.name}
                      </Badge>
                    )}

                    {agent.team && (
                      <span className="text-sm text-muted-foreground">{agent.team.name}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
