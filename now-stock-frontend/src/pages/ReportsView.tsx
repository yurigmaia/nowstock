/**
 * @component ReportsView
 * @description
 * Tela para visualização e EXPORTAÇÃO de relatórios.
 * Permite gerar PDF, Excel e Imprimir a tabela atual.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box, Title, Paper, SegmentedControl, Group, Button, Table, Stack, Loader, Center, Text
} from "@mantine/core";
import { IconFileTypePdf, IconFileSpreadsheet, IconPrinter } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiService } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type ReportType = 'current-stock' | 'low-stock' | 'most-moved' | 'history';
type ReportDataRow = any;

export function ReportsView() {
  const { t } = useTranslation();
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
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportType]);

  // Função auxiliar para obter o título do relatório atual traduzido
  const getReportTitle = () => {
    switch (reportType) {
      case 'current-stock': return t('reports.types.currentStock');
      case 'low-stock': return t('reports.types.lowStock');
      case 'most-moved': return t('reports.types.mostMoved');
      case 'history': return t('reports.types.history');
      default: return '';
    }
  };

  const getHeaders = (): string[] => {
    switch (reportType) {
      case 'current-stock': return [t('reports.columns.product'), t('reports.columns.quantity'), t('reports.columns.status')];
      case 'low-stock': return [t('reports.columns.product'), t('reports.columns.currentQty'), t('reports.columns.minQty')];
      case 'most-moved': return [t('reports.columns.product'), t('reports.columns.movements'), t('reports.columns.period')];
      case 'history': return [t('reports.columns.product'), t('reports.columns.type'), t('reports.columns.quantity'), t('reports.columns.date')];
      default: return [];
    }
  };

  const getRowData = (row: any): string[] => {
    switch (reportType) {
      case 'current-stock': 
        return [
          row.nome, 
          String(row.quantidade_atual), 
          row.quantidade_atual > row.quantidade_minima ? t('reports.status.ok') : t('reports.status.low')
        ];
      case 'low-stock': 
        return [row.nome, String(row.quantidade_atual), String(row.quantidade_minima)];
      case 'most-moved': 
        return [row.nome_produto, String(row.total_movimentacoes), row.periodo];
      case 'history': 
        // Traduzindo o tipo de movimentação se possível
        // eslint-disable-next-line no-case-declarations
        const typeLabel = t(`movements.types.${row.tipo}`) || row.tipo;
        return [row.nome_produto, typeLabel, String(row.quantidade), new Date(row.data_movimentacao).toLocaleDateString()];
      default: return [];
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`${t('reports.pdfTitle')}: ${getReportTitle()}`, 14, 10);
    autoTable(doc, {
      head: [getHeaders()],
      body: data.map(getRowData),
    });
    doc.save(`relatorio_${reportType}.pdf`);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map((row) => {
       const headers = getHeaders();
       const values = getRowData(row);
       return headers.reduce((acc, header, index) => ({ ...acc, [header]: values[index] }), {});
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
    XLSX.writeFile(workbook, `relatorio_${reportType}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderHeaders = () => {
    const headers = getHeaders();
    return (
      <Table.Tr>
        {headers.map((h, i) => <Table.Th key={i} ta={i > 0 ? 'center' : 'left'}>{h}</Table.Th>)}
      </Table.Tr>
    );
  };

  const renderRows = () => {
    if (data.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={5}>
            <Text ta="center" c="dimmed" py="xl">
              {t('reports.empty')}
            </Text>
          </Table.Td>
        </Table.Tr>
      );
    }
    return data.map((row, idx) => {
       const values = getRowData(row);
       return (
         <Table.Tr key={idx}>
           {values.map((v, i) => <Table.Td key={i} ta={i > 0 ? 'center' : 'left'}>{v}</Table.Td>)}
         </Table.Tr>
       );
    });
  };

  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">
        {t('reports.title')}
      </Title>

      <Paper p="md" withBorder shadow="md" radius="md">
        <Stack gap="md">
          <SegmentedControl
            value={reportType}
            onChange={(value) => setReportType(value as ReportType)}
            data={[
              { value: "current-stock", label: t('reports.types.currentStock') },
              { value: "low-stock", label: t('reports.types.lowStock') },
              { value: "most-moved", label: t('reports.types.mostMoved') },
              { value: "history", label: t('reports.types.history') },
            ]}
            color="orange"
            fullWidth
          />

          <Group justify="flex-end">
            <Button 
              variant="default" 
              leftSection={<IconFileTypePdf size={16} />}
              onClick={handleExportPDF}
              disabled={data.length === 0}
            >
              {t('reports.actions.exportPdf')}
            </Button>
            <Button 
              variant="default" 
              leftSection={<IconFileSpreadsheet size={16} />}
              onClick={handleExportExcel}
              disabled={data.length === 0}
            >
              {t('reports.actions.exportExcel')}
            </Button>
            <Button 
              variant="default" 
              leftSection={<IconPrinter size={16} />}
              onClick={handlePrint}
            >
              {t('reports.actions.print')}
            </Button>
          </Group>

          {loading ? (
            <Center h={200}><Loader color="orange" /></Center>
          ) : (
            <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
              <Table.Thead>{renderHeaders()}</Table.Thead>
              <Table.Tbody>{renderRows()}</Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}