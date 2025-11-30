/**
 * @component CategoriesView
 * @description
 * Tela para o Gerenciamento de Categorias (CRUD).
 * Permite ao usuário visualizar, adicionar, editar e excluir categorias.
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
import type { Category } from "../types/entities";
import { useTranslation } from "react-i18next";

export function CategoriesView() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchCategories = () => {
    setLoading(true);
    apiService.getCategories()
      .then(setCategories)
      .catch((err) => notifications.show({ 
        title: t('common.error'), 
        message: err.message, 
        color: 'red' 
      }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm({
    initialValues: {
      nome: "",
      descricao: "",
    },
    validate: {
      nome: (value) => (value.trim().length < 2 ? t('categories.form.errors.nameRequired') : null),
    }
  });

  const handleOpenModal = (category: Category | null) => {
    setEditingCategory(category);
    form.setValues({
      nome: category?.nome || "",
      descricao: category?.descricao || "",
    });
    openModal();
  };

  const handleCloseModal = () => {
    form.reset();
    setEditingCategory(null);
    closeModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setModalLoading(true);
    
    const payload = {
      nome: values.nome,
      descricao: values.descricao,
    };

    try {
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id_categoria, payload);
        notifications.show({ 
            title: t('common.success'), 
            message: t('categories.messages.updated'), 
            color: 'green' 
        });
      } else {
        await apiService.createCategory(payload);
        notifications.show({ 
            title: t('common.success'), 
            message: t('categories.messages.created'), 
            color: 'green' 
        });
      }
      fetchCategories();
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
    if (confirm(t('categories.confirmDelete'))) {
        try {
        await apiService.deleteCategory(id);
        notifications.show({ 
            title: t('common.success'), 
            message: t('categories.messages.deleted'), 
            color: 'gray' 
        });
        fetchCategories();
        } catch (err: any) {
        notifications.show({ 
            title: t('common.error'), 
            message: err.message, 
            color: 'red' 
        });
        }
    }
  };

  const rows = categories.map((category) => (
    <Table.Tr key={category.id_categoria}>
      <Table.Td>{category.nome}</Table.Td>
      <Table.Td>{category.descricao}</Table.Td>
      <Table.Td>
        <Group gap={4} justify="flex-end">
          <Tooltip label={t('common.edit')}>
            <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleOpenModal(category)}>
              <IconPencil size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('common.delete')}>
            <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(category.id_categoria)}>
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
          {t('categories.title')}
        </Title>
        <Button bg="orange.6" leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal(null)}>
          {t('categories.create')}
        </Button>
      </Group>

      <Paper p="md" withBorder shadow="md" radius="md">
        {loading ? (
          <Center h={200}><Loader color="orange" /></Center>
        ) : (
          <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('categories.table.name')}</Table.Th>
                <Table.Th>{t('categories.table.description')}</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>{t('categories.table.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text ta="center" c="dimmed" py="xl">{t('categories.empty')}</Text>
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
        title={editingCategory ? t('categories.modal.editTitle') : t('categories.modal.createTitle')}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label={t('categories.form.name')}
              placeholder={t('categories.form.placeholders.name')}
              required
              {...form.getInputProps("nome")}
            />
            <Textarea
              label={t('categories.form.description')}
              placeholder={t('categories.form.placeholders.description')}
              {...form.getInputProps("descricao")}
            />
            <Button fullWidth bg="orange.6" type="submit" loading={modalLoading}>
              {t('common.save')}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}