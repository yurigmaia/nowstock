/**
 * @component ProductsView
 * @description
 * Tela principal para Gerenciamento de Produtos (CRUD).
 * Exibe uma lista de produtos e permite ao usuário adicionar, editar
 * e excluir itens através de um modal.
 */
import { useState, useEffect } from "react";
import {
  Table,
  Title,
  Button,
  Group,
  ActionIcon,
  Tooltip,
  Container,
  Loader,
  Alert,
  Text,
  Paper,
  Center,
} from "@mantine/core";
import { IconPencil, IconTrash, IconPlus, IconAlertCircle } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { apiService } from "../services/api";
import type { Product } from "../types/entities";
import { ProductModal } from "../components/products/ProductModal.tsx";

export function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    apiService.getProducts()
      .then(setProducts)
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : "Falha ao carregar produtos";
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setSelectedProduct(null);
    openModal();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    openModal();
  };

  const handleDelete = (productId: number) => {
    console.log("Simulando exclusão:", productId);
    setProducts(currentProducts => currentProducts.filter(p => p.id_produto !== productId));
  };

  const handleSaveSuccess = () => {
    fetchProducts();
  };

  const rows = products.map((product) => (
    <Table.Tr key={product.id_produto}>
      <Table.Td>{product.nome}</Table.Td>
      <Table.Td>{product.etiqueta_rfid}</Table.Td>
      <Table.Td style={{ textAlign: 'center' }}>{product.quantidade_atual}</Table.Td>
      <Table.Td>{product.localizacao || "N/A"}</Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          <Tooltip label="Editar Produto">
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(product)}>
              <IconPencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Excluir Produto">
            <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(product.id_produto)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2} c="orange.7">Gerenciamento de Produtos</Title>
        <Button
          leftSection={<IconPlus size={14} />}
          onClick={handleAdd}
          bg="orange.6"
        >
          Adicionar Produto
        </Button>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Erro ao Carregar" color="red" variant="filled" mb="lg">
          {error}
        </Alert>
      )}

      <Paper withBorder shadow="md" p="md" radius="md">
        {loading ? (
          <Center h={200}><Loader color="orange" /></Center>
        ) : (
          <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nome</Table.Th>
                <Table.Th>Tag RFID</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Qtd. Atual</Table.Th>
                <Table.Th>Localização</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text ta="center" c="dimmed" py="xl">
                      Nenhum produto encontrado. Clique em "Adicionar Produto" para começar.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      {modalOpened && (
        <ProductModal
          opened={modalOpened}
          onClose={() => {
            closeModal();
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </Container>
  );
}