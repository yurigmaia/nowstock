/**
 * @component DashboardView
 * @description
 * Tela principal com cards de estatísticas e tabela de movimentações recentes.
 */
import { Grid, Paper, Text, Title, Group, ThemeIcon, Loader, Center, Alert, Table, Badge } from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import { IconBox, IconAlertCircle, IconAlertTriangle, IconArrowsLeftRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { DashboardSummary } from '../types/dashboard';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dashboard.";
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

  const rows = summary?.recentMovements?.map((mov) => (
    <Table.Tr key={mov.id_mov}>
      <Table.Td>{mov.produto}</Table.Td>
      <Table.Td>
        <Badge 
          color={mov.tipo === 'entrada' || mov.tipo === 'devolucao' ? 'green' : 'red'} 
          variant="light"
        >
          {mov.tipo.toUpperCase()}
        </Badge>
      </Table.Td>
      <Table.Td style={{ textAlign: 'center' }}>{mov.quantidade}</Table.Td>
      <Table.Td>{mov.usuario || 'Sistema'}</Table.Td>
      <Table.Td>{new Date(mov.data_movimentacao).toLocaleString('pt-BR')}</Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Title order={2} mb="lg" c="orange.7">
        {t('dashboard.title')}
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard 
            title={t('dashboard.totalProducts')} 
            value={summary?.totalProducts ?? 0} 
            icon={<IconBox size="1.4rem" />} 
            color="blue"
            loading={loading}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard 
            title={t('dashboard.lowStockItems')} 
            value={summary?.lowStockItems ?? 0}
            icon={<IconAlertTriangle size="1.4rem" />} 
            color="orange"
            loading={loading}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard 
            title={t('dashboard.movementsToday')}
            value={summary?.movementsToday ?? 0}
            icon={<IconArrowsLeftRight size="1.4rem" />} 
            color="teal"
            loading={loading}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">{t('dashboard.recentMovements')}</Title>
            
            {loading ? (
              <Center h={200}><Loader color="orange" /></Center>
            ) : (summary?.recentMovements && summary.recentMovements.length > 0) ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Produto</Table.Th>
                    <Table.Th>Tipo</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Qtd</Table.Th>
                    <Table.Th>Usuário</Table.Th>
                    <Table.Th>Data</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            ) : (
              <Text c="dimmed" ta="center" py="lg">Nenhuma movimentação recente.</Text>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}