/**
 * @component ProductsView
 * @description
 * Tela principal para Gerenciamento de Produtos (CRUD).
 * Exibe uma lista de produtos e permite ao usuário adicionar, editar
 * e excluir itens através de um modal.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ProductModal } from "../components/products/ProductModal";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";

export function ProductsView() {
  const { t } = useTranslation();
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
        const errorMessage = err instanceof Error ? err.message : t('products.errors.load');
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    setSelectedProduct(null);
    openModal();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    openModal();
  };

  const handleDelete = async (productId: number) => {
    if (confirm(t('products.confirmDelete'))) {
        try {
            await apiService.deleteProduct(productId);
            notifications.show({ 
                title: t('common.success'), 
                message: t('products.messages.deleted'), 
                color: 'gray' 
            });
            fetchProducts();
        } catch (err: any) {
            notifications.show({ 
                title: t('common.error'), 
                message: err.message, 
                color: 'red' 
            });
        }
    }
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
          <Tooltip label={t('products.actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(product)}>
              <IconPencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('products.actions.delete')}>
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
        <Title order={2} c="orange.7">{t('products.title')}</Title>
        <Button
          leftSection={<IconPlus size={14} />}
          onClick={handleAdd}
          bg="orange.6"
        >
          {t('products.create')}
        </Button>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} title={t('common.error')} color="red" variant="filled" mb="lg">
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
                <Table.Th>{t('products.table.name')}</Table.Th>
                <Table.Th>{t('products.table.rfid')}</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>{t('products.table.quantity')}</Table.Th>
                <Table.Th>{t('products.table.location')}</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>{t('products.table.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text ta="center" c="dimmed" py="xl">
                      {t('products.empty')}
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