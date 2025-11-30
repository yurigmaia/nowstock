/**
 * @component SuppliersView
 * @description
 * Tela para o Gerenciamento de Fornecedores (CRUD).
 * * ATUALIZAÇÃO:
 * - Apenas ADMIN pode Criar, Editar ou Excluir.
 * - Operadores e Visualizadores apenas veem a lista.
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
import { useTranslation } from "react-i18next";

import { apiService } from "../services/api";
import type { Supplier } from "../types/entities";
import { useAuth } from "../hooks/useAuth";

export function SuppliersView() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const canEdit = user?.nivel_acesso === 'admin';

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = () => {
    setLoading(true);
    apiService.getSuppliers()
      .then(setSuppliers)
      .catch((err) => notifications.show({ 
        title: t('common.error'), 
        message: err.message, 
        color: 'red' 
      }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuppliers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      nome: (value) => (value.trim().length < 2 ? t('suppliers.validation.nameRequired') : null),
      cnpj: (value) => (
        /^\d{14}$/.test(value.replace(/[^\d]/g, '')) ? null : t('suppliers.validation.cnpjInvalid')
      ),
      email: (value) => (value && /^\S+@\S+$/.test(value) ? null : t('suppliers.validation.emailInvalid')),
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
        notifications.show({ 
            title: t('common.success'), 
            message: t('suppliers.messages.updated'), 
            color: 'green' 
        });
      } else {
        await apiService.createSupplier(payload);
        notifications.show({ 
            title: t('common.success'), 
            message: t('suppliers.messages.created'), 
            color: 'green' 
        });
      }
      fetchSuppliers();
      handleCloseModal();
    } catch (err: any) {
      notifications.show({ 
          title: t('common.error'), 
          message: err.message, 
          color: 'red' 
      });
    } finally {
      setModalLoading(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (confirm(t('suppliers.confirmDelete'))) {
        try {
            await apiService.deleteSupplier(id);
            notifications.show({ 
                title: t('common.success'), 
                message: t('suppliers.messages.deleted'), 
                color: 'gray' 
            });
            fetchSuppliers();
        } catch (err: any) {
            notifications.show({ 
                title: t('common.error'), 
                message: err.message, 
                color: 'red' 
            });
        }
    }
  };

  const rows = suppliers.map((supplier) => (
    <Table.Tr key={supplier.id_fornecedor}>
      <Table.Td>{supplier.nome}</Table.Td>
      <Table.Td>{supplier.cnpj}</Table.Td>
      <Table.Td>{supplier.telefone}</Table.Td>
      <Table.Td>{supplier.email}</Table.Td>
      
      {canEdit && (
        <Table.Td>
            <Group gap={4} justify="flex-end">
            <Tooltip label={t('common.edit')}>
                <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleOpenModal(supplier)}>
                <IconPencil size={14} />
                </ActionIcon>
            </Tooltip>
            <Tooltip label={t('common.delete')}>
                <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(supplier.id_fornecedor)}>
                <IconTrash size={14} />
                </ActionIcon>
            </Tooltip>
            </Group>
        </Table.Td>
      )}
    </Table.Tr>
  ));

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Title order={2} c="orange.7">
          {t('suppliers.title')}
        </Title>
        
        {canEdit && (
            <Button bg="orange.6" leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal(null)}>
            {t('suppliers.create')}
            </Button>
        )}
      </Group>

      <Paper p="md" withBorder shadow="md" radius="md">
        {loading ? (
          <Center h={200}><Loader color="orange" /></Center>
        ) : (
          <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('suppliers.table.name')}</Table.Th>
                <Table.Th>{t('suppliers.table.cnpj')}</Table.Th>
                <Table.Th>{t('suppliers.table.phone')}</Table.Th>
                <Table.Th>{t('suppliers.table.email')}</Table.Th>
                {canEdit && <Table.Th style={{ textAlign: 'right' }}>{t('suppliers.table.actions')}</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={canEdit ? 5 : 4}>
                    <Text ta="center" c="dimmed" py="xl">{t('suppliers.empty')}</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      {modalOpened && (
        <Modal 
            opened={modalOpened} 
            onClose={handleCloseModal} 
            title={editingSupplier ? t('suppliers.modal.editTitle') : t('suppliers.modal.createTitle')}
            centered
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
                <TextInput
                label={t('suppliers.form.name')}
                placeholder={t('suppliers.form.placeholders.name')}
                required
                {...form.getInputProps("nome")}
                />
                <TextInput
                label={t('suppliers.form.cnpj')}
                placeholder="00000000000191"
                maxLength={14}
                required
                {...form.getInputProps("cnpj")}
                />
                <TextInput
                label={t('suppliers.form.phone')}
                placeholder="(11) 98765-4321"
                {...form.getInputProps("telefone")}
                />
                <TextInput
                label={t('suppliers.form.email')}
                placeholder="email@example.com"
                {...form.getInputProps("email")}
                />
                <Textarea
                label={t('suppliers.form.address')}
                placeholder={t('suppliers.form.placeholders.address')}
                {...form.getInputProps("endereco")}
                />
                <Button fullWidth bg="orange.6" type="submit" loading={modalLoading}>
                {t('common.save')}
                </Button>
            </Stack>
            </form>
        </Modal>
      )}
    </Box>
  );
}