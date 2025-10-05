import { Grid, Paper, Text, Title, Group, ThemeIcon, Loader, Center, Alert } from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import { IconBox, IconAlertCircle, IconAlertTriangle, IconArrowsLeftRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDashboardSummary();
        setSummary(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('Failed to load dashboard data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red" variant="filled">
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Title order={2} mb="lg" c="orange.7">
        {t('dashboard.title')}
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard 
            title={t('dashboard.stats.totalProducts')} 
            value={summary?.totalProducts ?? 0} 
            icon={<IconBox size="1.4rem" />} 
            color="blue"
            loading={loading}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard 
            title={t('dashboard.stats.lowStock')} 
            value={summary?.lowStockItems ?? 0}
            icon={<IconAlertTriangle size="1.4rem" />} 
            color="orange"
            loading={loading}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatCard 
            title={t('dashboard.stats.movementsToday')}
            value={summary?.movementsToday ?? 0}
            icon={<IconArrowsLeftRight size="1.4rem" />} 
            color="teal"
            loading={loading}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12 }}>
          {loading ? (
            <Center h={300}><Loader /></Center>
          ) : (
            <Paper withBorder p="md" radius="md" h={300}>
              <Title order={5}>{t('dashboard.recentMovements')}</Title>
              <Text c="dimmed" size="sm">Chart will be here...</Text>
            </Paper>
          )}
        </Grid.Col>
      </Grid>
    </>
  );
}