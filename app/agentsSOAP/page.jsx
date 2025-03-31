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

export default function AgentsSOAPPage() {
  // Estados para gerir os dados e a interatividade da página
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Opções de raridade para o filtro de dropdown
  const rarityOptions = [
    { id: 'all', name: 'Todas as Raridades' },
    { id: 'Distinto', name: 'Distinto' },
    { id: 'Excecional', name: 'Excecional' },
    { id: 'Superior', name: 'Superior' },
    { id: 'Mestre', name: 'Mestre' },
  ];

  // Opções de equipa para o filtro de dropdown
  const teamOptions = [
    { id: 'all', name: 'Todas as Equipas' },
    { id: 'Terroristas', name: 'Terroristas' },
    { id: 'Contraterroristas', name: 'Contraterroristas' },
  ];

  useEffect(() => {
    async function fetchAgentsSOAP() {
      try {
        setLoading(true);
        setError(null);

        // Construir a requisição SOAP
        const soapRequest = `
          <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
              <tns:AgentRequest xmlns:tns="http://cswatch.com/agents">
                ${searchTerm ? `<tns:name>${searchTerm}</tns:name>` : ''}
                ${selectedRarity !== 'all' ? `<tns:rarity>${selectedRarity}</tns:rarity>` : ''}
                ${selectedTeam !== 'all' ? `<tns:team>${selectedTeam}</tns:team>` : ''}
              </tns:AgentRequest>
            </soap:Body>
          </soap:Envelope>
        `;

        console.log('Enviando requisição SOAP:', soapRequest); // Debug

        // Fazer a chamada SOAP
        const response = await fetch('/api/soap/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            SOAPAction: 'http://cswatch.com/agents/getAgents',
          },
          body: soapRequest,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`SOAP Error: ${response.status} - ${errorText}`);
        }

        const xmlText = await response.text();
        console.log('Resposta SOAP recebida:', xmlText); // Debug

        // Fazer o parsing da resposta XML ( ou seja, transformar o XML em um objeto JS )
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Extrair os agentes da resposta SOAP
        const agentNodes = xmlDoc.evaluate(
          '//tns:agent',
          xmlDoc,
          (prefix) => (prefix === 'tns' ? 'http://cswatch.com/agents' : null),
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        // Converter os nós XML em objetos de agente
        const parsedAgents = [];
        for (let i = 0; i < agentNodes.snapshotLength; i++) {
          const agentNode = agentNodes.snapshotItem(i);

          // Função auxiliar para extrair texto de um elemento filho
          function getElementText(parentNode, elementName) {
            const element = xmlDoc.evaluate(
              `tns:${elementName}`,
              parentNode,
              (prefix) => (prefix === 'tns' ? 'http://cswatch.com/agents' : null),
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue;
            return element ? element.textContent : '';
          }

          // Extrair informações de raridade
          const rarityNode = xmlDoc.evaluate(
            'tns:rarity',
            agentNode,
            (prefix) => (prefix === 'tns' ? 'http://cswatch.com/agents' : null),
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;

          // Extrair informações da equipa
          const teamNode = xmlDoc.evaluate(
            'tns:team',
            agentNode,
            (prefix) => (prefix === 'tns' ? 'http://cswatch.com/agents' : null),
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;

          const agent = {
            id: getElementText(agentNode, 'id'),
            name: getElementText(agentNode, 'name'),
            image: getElementText(agentNode, 'image'),
            rarity: rarityNode
              ? {
                  name: getElementText(rarityNode, 'name'),
                  color: getElementText(rarityNode, 'color'),
                }
              : null,
            team: teamNode
              ? {
                  name: getElementText(teamNode, 'name'),
                }
              : null,
          };

          parsedAgents.push(agent);
        }

        setAgents(parsedAgents);
      } catch (err) {
        console.error('Erro ao buscar agentes via SOAP:', err);
        setError('Falha ao carregar agentes. Por favor, tente novamente mais tarde.');
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAgentsSOAP();
  }, [searchTerm, selectedRarity, selectedTeam]);

  // Funções para lidar com mudanças nos filtros
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
        <h1 className="text-3xl font-bold mb-6">CS2 Agents (SOAP API)</h1>
        <Separator className="my-4" />
        // Secção de filtros
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
        // Secção de loading
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
        {!loading && !error && agents.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg">Nenhum agente encontrado</p>
          </div>
        )}
        //secção de agentes
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
