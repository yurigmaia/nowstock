/**
 * @component DashboardView
 * @description
 * Tela principal (home) da aplicação. Exibe um resumo das informações
 * mais importantes do sistema, como total de produtos, itens com
 * estoque baixo e movimentações recentes. Busca os dados do 'apiService'.
 */
import { Grid, Paper, Text, Title, Group, ThemeIcon, Loader, Center, Alert } from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import { IconBox, IconAlertCircle, IconAlertTriangle, IconArrowsLeftRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { DashboardSummary } from '../types/dashboard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: MantineColor;
  loading: boolean;
}

const StatCard = ({ title, value, icon, color, loading }: StatCardProps) => (
  <Paper withBorder p="md" radius="md">
    <Group>
      <ThemeIcon color={color} variant="light" size={38} radius="md">
        {icon}
      </ThemeIcon>
      <div>
        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>{title}</Text>
        {loading ? <Loader size="xs" mt="xs" /> : <Text fw={700} size="xl">{value}</Text>}
      </div>
    </Group>
  </Paper>
);

export function DashboardView() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao carregar dados do dashboard.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Erro!" color="red" variant="filled">
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Title order={2} mb="lg" c="orange.7">
        Dashboard
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard 
            title="Total de Produtos" 
            value={summary?.totalProducts ?? 0} 
            icon={<IconBox size="1.4rem" />} 
            color="blue"
            loading={loading}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard 
            title="Itens com Estoque Baixo" 
            value={summary?.lowStockItems ?? 0}
            icon={<IconAlertTriangle size="1.4rem" />} 
            color="orange"
            loading={loading}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard 
            title="Movimentações Hoje"
            value={summary?.movementsToday ?? 0}
            icon={<IconArrowsLeftRight size="1.4rem" />} 
            color="teal"
            loading={loading}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12 }}>
          {loading ? (
            <Center h={300}><Loader color="orange" /></Center>
          ) : (
            <Paper withBorder p="md" radius="md" h={300}>
              <Title order={5}>Movimentações Recentes</Title>
              <Text c="dimmed" size="sm">O gráfico estará aqui...</Text>
            </Paper>
          )}
        </Grid.Col>
      </Grid>
    </>
  );
}