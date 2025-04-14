'use client';

import { useState, useEffect, useRef } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Component } from '@/components/line-chart';

export default function MarketPage() {
  const [selectedSkin, setSelectedSkin] = useState('');
  const [timeRange, setTimeRange] = useState('week');
  const [priceData, setPriceData] = useState(null);
  const [availableSkins, setAvailableSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Este estado armazenará as atualizações em tempo real
  const [realtimeUpdates, setRealtimeUpdates] = useState([]);

  // Referência para controlar o intervalo de simulação
  const intervalRef = useRef(null);

  // Contador de atualização
  const [nextUpdateCountdown, setNextUpdateCountdown] = useState(30);

  // Inicializar com a lista de skins disponíveis
  useEffect(() => {
    async function fetchAvailableSkins() {
      try {
        setLoading(true);
        const response = await fetch('/api/grpc');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        setAvailableSkins(data.availableSkins);

        // Selecionar a primeira skin por padrão
        if (data.availableSkins.length > 0 && !selectedSkin) {
          setSelectedSkin(data.availableSkins[0].id);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching available skins:', err);
        setError('Falha ao carregar a lista de skins. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }

    fetchAvailableSkins();
  }, []);

  // Buscar dados históricos quando a skin ou o intervalo de tempo mudar
  useEffect(() => {
    async function fetchPriceHistory() {
      if (!selectedSkin) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/grpc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            method: 'GetPriceHistory',
            params: {
              skin_id: selectedSkin,
              time_range: timeRange,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setPriceData(data);
      } catch (err) {
        console.error('Error fetching price history:', err);
        setError('Falha ao carregar o histórico de preços. Por favor, tente novamente mais tarde.');
        setPriceData(null);
      } finally {
        setLoading(false);
      }
    }

    if (selectedSkin) {
      fetchPriceHistory();
    }
  }, [selectedSkin, timeRange]);

  // Simula atualizações em tempo real (como substituição para o streaming gRPC)
  useEffect(() => {
    // Limpa qualquer intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!selectedSkin || !priceData) return;

    // Simula atualizações a cada 30 segundos
    intervalRef.current = setInterval(() => {
      const lastPrice = priceData.price_points[priceData.price_points.length - 1]?.price || 0;
      const changePercentage = (Math.random() * 4 - 2) * 0.5; // -1% a +1% (aumentado para mostrar movimento)
      const newPrice = Number(lastPrice) * (1 + changePercentage / 100);

      // Adiciona atualização à lista
      const update = {
        skin_id: selectedSkin,
        skin_name: priceData.skin_name,
        price: newPrice,
        timestamp: new Date().toISOString(),
        change_percentage: changePercentage,
      };

      setRealtimeUpdates((prev) => [update, ...prev].slice(0, 10));

      // Atualiza o gráfico
      setPriceData((prev) => {
        if (!prev) return prev;

        const updatedPoints = [...prev.price_points];

        // Para visualização diária, adicionamos pontos
        // Para outros períodos, atualizamos o último ponto
        if (timeRange === 'day') {
          updatedPoints.push({
            price: newPrice,
            timestamp: new Date().toISOString(),
          });

          // Mantêm apenas os pontos das últimas 24 horas
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          const filtered = updatedPoints.filter((point) => new Date(point.timestamp) > oneDayAgo);

          return {
            ...prev,
            price_points: filtered,
          };
        } else {
          // Atualiza o último ponto para outros intervalos
          if (updatedPoints.length > 0) {
            updatedPoints[updatedPoints.length - 1] = {
              ...updatedPoints[updatedPoints.length - 1],
              price: newPrice,
            };
          }

          return {
            ...prev,
            price_points: updatedPoints,
          };
        }
      });
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedSkin, priceData, timeRange]);

  // Adicione este useEffect para gerir o contador de atualização
  // Este useEffect irá reiniciar o contador sempre que houver uma nova atualização
  useEffect(() => {
    // Limpar o contador anterior
    setNextUpdateCountdown(30);

    const countdownInterval = setInterval(() => {
      setNextUpdateCountdown((prev) => {
        if (prev <= 1) {
          return 30; // Reiniciar quando chegar a zero
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [realtimeUpdates]);

  // Função para preparar os dados do gráfico (LineChart)
  const prepareChartData = () => {
    if (!priceData || !priceData.price_points) return null;

    // Formata os dados para o gráfico usado
    const formattedData = {
      name: priceData.skin_name,
      data: priceData.price_points.map((point) => {
        const date = new Date(point.timestamp);
        let formattedDate;

        // Formata a data de acordo com o intervalo de tempo
        switch (timeRange) {
          case 'day':
            formattedDate = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            break;
          case 'week':
            formattedDate = date.toLocaleDateString([], { weekday: 'short' });
            break;
          case 'month':
            formattedDate = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
            break;
          case 'year':
            formattedDate = date.toLocaleDateString([], { month: 'short' });
            break;
          default:
            formattedDate = date.toLocaleDateString();
        }

        return {
          x: formattedDate,
          y: parseFloat(point.price),
        };
      }),
    };

    return [formattedData]; // Retorna como um array
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar className="hidden md:flex" />
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-4">Mercado CS2 (gRPC)</h1>
          <p className="text-muted-foreground mb-6">
            Acompanhe em tempo real as variações de preço das skins no mercado utilizando a
            tecnologia gRPC.
          </p>

          <Separator className="my-6" />

          <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Gráfico de Preços</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-9">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">Selecione uma Skin</label>
                      <Select value={selectedSkin} onValueChange={setSelectedSkin}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma skin" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSkins.map((skin) => (
                            <SelectItem key={skin.id} value={skin.id}>
                              {skin.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Período</label>
                      <RadioGroup
                        value={timeRange}
                        onValueChange={setTimeRange}
                        className="flex space-x-2"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="day" id="day" />
                          <Label htmlFor="day">Dia</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="week" id="week" />
                          <Label htmlFor="week">Semana</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="month" id="month" />
                          <Label htmlFor="month">Mês</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="h-[350px] flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : priceData ? (
                    <Component
                      data={prepareChartData()}
                      title={`Histórico de Preço: ${priceData.skin_name}`}
                      valuePrefix="€"
                      color="hsl(24, 100%, 50%)"
                    />
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                      Selecione uma skin para ver o histórico de preços
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Atualizações em Tempo Real</CardTitle>
                    <div className="text-xs text-muted-foreground">
                      Próxima atualização em:{' '}
                      <span className="font-medium">{nextUpdateCountdown}s</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto">
                    {realtimeUpdates.length > 0 ? (
                      <div className="space-y-2">
                        {realtimeUpdates.map((update, index) => (
                          <div
                            key={index}
                            className="p-3 border rounded-md flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium">{update.skin_name}</div>
                              <div className="text-lg font-bold">
                                €{Number(update.price).toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(update.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </div>
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                update.change_percentage >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {update.change_percentage >= 0 ? '+' : ''}
                              {update.change_percentage.toFixed(2)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Aguardando atualizações em tempo real...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
