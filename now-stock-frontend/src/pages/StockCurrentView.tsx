/**
 * @component StockCurrentView
 * @description
 * Tela de consulta que exibe uma lista de todos os produtos e seu
 * status atual de estoque. Busca dados de produtos, categorias e
 * fornecedores do 'apiService' e os combina para uma visualização rica.
 */
import { useState, useEffect } from "react";
import {
  Box,
  Title,
  Paper,
  Table,
  Text,
  Center,
  Loader,
  Alert,
  Container,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { apiService } from "../services/api";
import type { Product, Category, Supplier } from "../types/entities";

interface RichStockItem {
  id_produto: number;
  nome_produto: string;
  nome_categoria: string;
  nome_fornecedor: string;
  quantidade_atual: number;
  localizacao: string | null;
}

export function StockCurrentView() {
  const [stockItems, setStockItems] = useState<RichStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [products, categories, suppliers] = await Promise.all([
          apiService.getProducts(),
          apiService.getCategories(),
          apiService.getSuppliers(),
        ]);

        const categoryMap = new Map(categories.map((c: Category) => [c.id_categoria, c.nome]));
        const supplierMap = new Map(suppliers.map((s: Supplier) => [s.id_fornecedor, s.nome]));

        const richData = products.map((product: Product) => ({
          id_produto: product.id_produto,
          nome_produto: product.nome,
          quantidade_atual: product.quantidade_atual,
          localizacao: product.localizacao,
          nome_categoria: product.id_categoria ? categoryMap.get(product.id_categoria) || 'N/A' : 'N/A',
          nome_fornecedor: product.id_fornecedor ? supplierMap.get(product.id_fornecedor) || 'N/A' : 'N/A',
        }));

        setStockItems(richData);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Falha ao carregar dados do estoque";
        console.error("Erro ao buscar dados do estoque:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const rows = stockItems.map((item) => (
    <Table.Tr key={item.id_produto}>
      <Table.Td>{item.nome_produto}</Table.Td>
      <Table.Td>{item.nome_categoria}</Table.Td>
      <Table.Td>{item.nome_fornecedor}</Table.Td>
      <Table.Td ta="center">{item.quantidade_atual}</Table.Td>
      <Table.Td>{item.localizacao || '---'}</Table.Td>
    </Table.Tr>
  ));

  if (loading) {
    return (
      <Center h="50vh">
        <Loader color="orange" size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="md" pt="xl">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Erro ao Carregar Dados"
          color="red"
          variant="filled"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">
        Estoque Atual
      </Title>

      <Paper p="md" withBorder shadow="md" radius="md">
        <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Produto</Table.Th>
              <Table.Th>Categoria</Table.Th>
              <Table.Th>Fornecedor</Table.Th>
              <Table.Th ta="center">Quantidade Atual</Table.Th>
              <Table.Th>Localização</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? rows : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="dimmed" py="xl">
                    Nenhum item em estoque encontrado.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Box>
  );
}