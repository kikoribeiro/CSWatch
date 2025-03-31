'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

// O componente agora aceita props para dados dinâmicos
export function Component({ data, title, valuePrefix = '$', color = 'hsl(var(--chart-1))' }) {
  // Verificar se temos dados válidos
  if (!data || !data.length || !data[0]?.data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || 'Histórico de Preços'}</CardTitle>
          <CardDescription>Sem dados disponíveis</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum dado disponível para exibir</p>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  const chartData = data[0].data;
  const seriesName = data[0].name;

  // Determinar a tendência calculando a diferença entre o primeiro e o último valor
  const firstPrice = chartData[0]?.y || 0;
  const lastPrice = chartData[chartData.length - 1]?.y || 0;
  const priceDifference = lastPrice - firstPrice;
  const percentChange = firstPrice > 0 ? (priceDifference / firstPrice) * 100 : 0;
  const isTrendingUp = percentChange >= 0;

  // Configurar a aparência do gráfico
  const chartConfig = {
    price: {
      label: seriesName,
      color: color,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Histórico de Preços'}</CardTitle>
        <CardDescription>
          {seriesName} - {new Date().toLocaleDateString([], { month: 'long', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // Se as datas são longas, truncar para exibir apenas parte delas
                tickFormatter={(value) => {
                  if (typeof value === 'string') {
                    if (value.length > 10) {
                      return value.slice(0, 8); // Truncar datas longas
                    }
                    return value;
                  }
                  return value;
                }}
              />
              <YAxis
                tickFormatter={(value) => `${valuePrefix}${value.toFixed(2)}`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={['auto', 'auto']}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value) => `${valuePrefix}${Number(value).toFixed(2)}`}
                  />
                }
              />
              <Line
                dataKey="y"
                type="monotone"
                stroke="var(--color-price)"
                strokeWidth={2}
                dot={{
                  fill: 'var(--color-price)',
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 0,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div
          className={`flex gap-2 font-medium leading-none ${isTrendingUp ? 'text-green-500' : 'text-red-500'}`}
        >
          {isTrendingUp ? 'Tendência de alta' : 'Tendência de queda'} de{' '}
          {Math.abs(percentChange).toFixed(2)}%
          {isTrendingUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        </div>
        <div className="leading-none text-muted-foreground">
          Preço atual: {valuePrefix}
          {lastPrice.toFixed(2)}
        </div>
      </CardFooter>
    </Card>
  );
}
