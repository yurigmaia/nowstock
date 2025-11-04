/**
 * @component SuppliersView
 * @description
 * Tela para o Gerenciamento de Fornecedores (CRUD).
 * Permite ao usuário visualizar, adicionar, editar e excluir fornecedores.
 * Os dados são buscados e enviados através do 'apiService'.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Box,
  Title,
  Button,
  Group,
  Paper,
  Table,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Stack,
  Text,
  Center,
  Loader,
  Tooltip,
} from "@mantine/core";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

import { apiService } from "../services/api";
import type { Supplier } from "../types/entities";

export function SuppliersView() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = () => {
    setLoading(true);
    apiService.getSuppliers()
      .then(setSuppliers)
      .catch((err) => notifications.show({ title: 'Erro', message: err.message, color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const form = useForm({
    initialValues: {
      nome: "",
      cnpj: "",
      telefone: "",
      email: "",
      endereco: "",
    },
    validate: {
      nome: (value) => (value.trim().length < 2 ? 'Nome é obrigatório' : null),
      cnpj: (value) => (
        /^\d{14}$/.test(value.replace(/[^\d]/g, '')) ? null : 'CNPJ deve ter 14 dígitos'
      ),
      email: (value) => (value && /^\S+@\S+$/.test(value) ? null : 'Email inválido'),
    }
  });

  const handleOpenModal = (supplier: Supplier | null) => {
    setEditingSupplier(supplier);
    form.setValues({
      nome: supplier?.nome || "",
      cnpj: supplier?.cnpj || "",
      telefone: supplier?.telefone || "",
      email: supplier?.email || "",
      endereco: supplier?.endereco || "",
    });
    openModal();
  };

  const handleCloseModal = () => {
    form.reset();
    setEditingSupplier(null);
    closeModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setModalLoading(true);
    
    const payload = {
      nome: values.nome,
      cnpj: values.cnpj.replace(/[^\d]/g, ''),
      telefone: values.telefone,
      email: values.email,
      endereco: values.endereco,
    };

    try {
      if (editingSupplier) {
        await apiService.updateSupplier(editingSupplier.id_fornecedor, payload);
        notifications.show({ title: 'Sucesso', message: 'Fornecedor atualizado.', color: 'green' });
      } else {
        await apiService.createSupplier(payload);
        notifications.show({ title: 'Sucesso', message: 'Fornecedor adicionado.', color: 'green' });
      }
      fetchSuppliers();
      handleCloseModal();
    } catch (err: any) {
      notifications.show({ title: 'Erro', message: err.message, color: 'red' });
    } finally {
      setModalLoading(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteSupplier(id);
      notifications.show({ title: 'Excluído', message: 'Fornecedor removido.', color: 'gray' });
      fetchSuppliers();
    } catch (err: any) {
      notifications.show({ title: 'Erro', message: err.message, color: 'red' });
    }
  };

  const rows = suppliers.map((supplier) => (
    <Table.Tr key={supplier.id_fornecedor}>
      <Table.Td>{supplier.nome}</Table.Td>
      <Table.Td>{supplier.cnpj}</Table.Td>
      <Table.Td>{supplier.telefone}</Table.Td>
      <Table.Td>{supplier.email}</Table.Td>
      <Table.Td>
        <Group gap={4} justify="flex-end">
          <Tooltip label="Editar">
            <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleOpenModal(supplier)}>
              <IconPencil size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Excluir">
            <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(supplier.id_fornecedor)}>
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Title order={2} c="orange.7">
          Fornecedores
        </Title>
        <Button bg="orange.6" leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal(null)}>
          Adicionar Fornecedor
        </Button>
      </Group>

      <Paper p="md" withBorder shadow="md" radius="md">
        {loading ? (
          <Center h={200}><Loader color="orange" /></Center>
        ) : (
          <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nome</Table.Th>
                <Table.Th>CNPJ</Table.Th>
                <Table.Th>Telefone</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text ta="center" c="dimmed" py="xl">Nenhum fornecedor encontrado.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal 
        opened={modalOpened} 
        onClose={handleCloseModal} 
        title={editingSupplier ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nome"
              placeholder="Nome do Fornecedor"
              required
              {...form.getInputProps("nome")}
            />
            <TextInput
              label="CNPJ"
              placeholder="00000000000191"
              maxLength={14}
              required
              {...form.getInputProps("cnpj")}
            />
            <TextInput
              label="Telefone"
              placeholder="(11) 98765-4321"
              {...form.getInputProps("telefone")}
            />
            <TextInput
              label="Email"
              placeholder="email@example.com"
              {...form.getInputProps("email")}
            />
            <Textarea
              label="Endereço"
              placeholder="Rua A, 100, São Paulo"
              {...form.getInputProps("endereco")}
            />
            <Button fullWidth bg="orange.6" type="submit" loading={modalLoading}>
              Salvar
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}