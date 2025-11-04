/**
 * @component ReportsView
 * @description
 * Tela para visualização de diversos relatórios do sistema.
 * O usuário pode alternar entre tipos de relatório (Estoque Atual, Produtos em Falta, etc.)
 * e os dados são buscados dinamicamente do 'apiService'.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Title,
  Paper,
  SegmentedControl,
  Group,
  Button,
  Table,
  Stack,
  Loader,
  Center,
  Text,
} from "@mantine/core";
import {
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconPrinter,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { apiService } from "../services/api";

type ReportType = 'current-stock' | 'low-stock' | 'most-moved' | 'history';
type ReportDataRow = any;

export function ReportsView() {
  const [reportType, setReportType] = useState<ReportType>("current-stock");
  const [data, setData] = useState<ReportDataRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setData([]);
      try {
        const reportData = await apiService.getReport(reportType);
        setData(reportData);
      } catch (error) {
        console.error(error);
        // TODO: Adicionar notificação de erro
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportType]);

  const renderHeaders = () => {
    switch (reportType) {
      case 'current-stock':
        return (
          <Table.Tr>
            <Table.Th>Produto</Table.Th>
            <Table.Th ta="center">Quantidade</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        );
      case 'low-stock':
        return (
          <Table.Tr>
            <Table.Th>Produto</Table.Th>
            <Table.Th ta="center">Quantidade Atual</Table.Th>
            <Table.Th ta="center">Qtd. Mínima</Table.Th>
          </Table.Tr>
        );
      case 'most-moved':
        return (
          <Table.Tr>
            <Table.Th>Produto</Table.Th>
            <Table.Th ta="center">Movimentações</Table.Th>
            <Table.Th>Período</Table.Th>
          </Table.Tr>
        );
      case 'history':
        return (
          <Table.Tr>
            <Table.Th>Produto</Table.Th>
            <Table.Th>Tipo</Table.Th>
            <Table.Th ta="center">Quantidade</Table.Th>
            <Table.Th>Data</Table.Th>
          </Table.Tr>
        );
      default:
        return <Table.Tr><Table.Th>Relatório</Table.Th></Table.Tr>;
    }
  };

  const renderRows = () => {
    if (data.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={5}>
            <Text ta="center" c="dimmed" py="xl">
              Nenhum dado encontrado para este relatório.
            </Text>
          </Table.Td>
        </Table.Tr>
      );
    }
    
    switch (reportType) {
      case 'current-stock':
        return data.map((row) => (
          <Table.Tr key={row.id_produto}>
            <Table.Td>{row.nome}</Table.Td>
            <Table.Td ta="center">{row.quantidade_atual}</Table.Td>
            <Table.Td>{row.quantidade_atual > row.quantidade_minima ? 'OK' : 'Baixo'}</Table.Td>
          </Table.Tr>
        ));
      case 'low-stock':
         return data.map((row) => (
          <Table.Tr key={row.id_produto}>
            <Table.Td>{row.nome}</Table.Td>
            <Table.Td ta="center">{row.quantidade_atual}</Table.Td>
            <Table.Td ta="center">{row.quantidade_minima}</Table.Td>
          </Table.Tr>
        ));
      case 'most-moved':
        return data.map((row, idx) => (
          <Table.Tr key={idx}>
            <Table.Td>{row.nome_produto}</Table.Td>
            <Table.Td ta="center">{row.total_movimentacoes}</Table.Td>
            <Table.Td>{row.periodo}</Table.Td>
          </Table.Tr>
        ));
      case 'history':
        return data.map((row) => (
          <Table.Tr key={row.id_mov}>
            <Table.Td>{row.nome_produto}</Table.Td>
            <Table.Td>{row.tipo}</Table.Td>
            <Table.Td ta="center">{row.quantidade}</Table.Td>
            <Table.Td>{new Date(row.data_movimentacao).toLocaleString('pt-BR')}</Table.Td>
          </Table.Tr>
        ));
      default:
        return (
          <Table.Tr>
            <Table.Td colSpan={5}>
              <Text ta="center" c="dimmed" py="xl">
                Visualização para este relatório não implementada.
              </Text>
            </Table.Td>
          </Table.Tr>
        );
    }
  };

  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">
        Relatórios
      </Title>

      <Paper p="md" withBorder shadow="md" radius="md">
        <Stack gap="md">
          <SegmentedControl
            value={reportType}
            onChange={(value) => setReportType(value as ReportType)}
            data={[
              { value: "current-stock", label: "Estoque Atual" },
              { value: "low-stock", label: "Produtos em Falta" },
              { value: "most-moved", label: "Mais Movimentados" },
              { value: "history", label: "Histórico" },
            ]}
            color="orange"
            fullWidth
          />

          <Group justify="flex-end">
            <Button variant="default" leftSection={<IconFileTypePdf size={16} />}>
              Exportar PDF
            </Button>
            <Button variant="default" leftSection={<IconFileSpreadsheet size={16} />}>
              Exportar Excel
            </Button>
            <Button variant="default" leftSection={<IconPrinter size={16} />}>
              Imprimir
            </Button>
          </Group>

          {loading ? (
            <Center h={200}><Loader color="orange" /></Center>
          ) : (
            <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
              <Table.Thead>
                {renderHeaders()}
              </Table.Thead>
              <Table.Tbody>
                {renderRows()}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}