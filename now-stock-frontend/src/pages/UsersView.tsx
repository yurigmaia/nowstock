/**
 * @component UsersView
 * @description
 * Tela de administração para Gerenciamento de Usuários.
 * Permite listar, aprovar, bloquear e editar usuários.
 * Correções aplicadas:
 * - Tradução completa com i18n.
 * - Correção do payload de envio (mapeamento name -> nome, level -> nivel_acesso).
 * - Inclusão do campo 'status' obrigatório no update.
 * - Segurança: Senha nunca é exibida na edição, apenas redefinida se preenchida.
 */
import { useState, useEffect } from 'react';
import {
  Table, Title, Button, Group, Badge, Modal,
  TextInput, PasswordInput, Select, Stack, Text,
  Center, Loader, ActionIcon, Tooltip,
  Box, Paper
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCheck, IconX, IconPlus,
  IconPencil, IconBan
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { apiService } from '../services/api';
import { useTranslation } from 'react-i18next';
import type { User, UserStatus } from '../types/entities';

const statusColors: Record<UserStatus, string> = {
  ativo: 'green',
  pendente: 'orange',
  inativo: 'gray',
};

const DEFAULT_PASSWORD = 'Senha@2025';

export function UsersView() {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      level: "operador",
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : t('validation.required')),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t('validation.emailInvalid')),
      password: (value) => {
        // Na edição, senha é opcional (só preenche se quiser resetar)
        if (editingUser) {
             if (value.length > 0 && value.length < 6) return t('users.errors.passwordShort');
             return null;
        }
        // Na criação, validamos se o usuário limpar o campo padrão
        if (value.length < 6) return t('users.errors.passwordShort');
        return null;
      },
    },
  });

  const fetchUsers = () => {
    setLoading(true);
    apiService.getUsers()
      .then(setUsers)
      .catch((err) => notifications.show({ 
        title: t('common.error'), 
        message: err.message, 
        color: 'red' 
      }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (user: User | null) => {
    setEditingUser(user);
    if (user) {
      // MODO EDIÇÃO
      form.setValues({
        name: user.nome,
        email: user.email,
        password: "", // MANTENHA VAZIO: Não mostramos a senha atual por segurança
        level: user.nivel_acesso,
      });
    } else {
      // MODO CRIAÇÃO
      form.setValues({
        name: "",
        email: "",
        password: DEFAULT_PASSWORD,
        level: "operador",
      });
    }
    setOpened(true);
  };

  // Substitua a função handleSubmit atual por esta:
  const handleSubmit = async (values: typeof form.values) => {
    setModalLoading(true);
    try {
      if (editingUser) {
        // 1. Atualiza dados cadastrais (Nome, Email, Nível, Status)
        const updatePayload = {
            nome: values.name,
            email: values.email,
            nivel_acesso: values.level,
            status: editingUser.status
        };

        await apiService.adminUpdateUser(editingUser.id_usuario, updatePayload);
        
        // 2. Se o admin digitou uma senha nova, chama a rota de reset
        if (values.password && values.password.trim() !== "") {
            await apiService.adminResetPassword(editingUser.id_usuario, values.password);
             notifications.show({ 
                title: t('common.success'), 
                message: t('users.messages.updated'), // "Usuário atualizado"
                color: 'green' 
            });
        } else {
            // Só atualizou dados, sem senha
            notifications.show({ 
                title: t('common.success'), 
                message: t('users.messages.updated'), 
                color: 'green' 
            });
        }

      } else {
        // MODO CRIAÇÃO (Permanece igual)
        await apiService.createUser({
          name: values.name,
          email: values.email,
          password: values.password,
          level: values.level,
        });
        notifications.show({ 
            title: t('common.success'), 
            message: t('users.messages.created', { password: values.password }), 
            color: 'green', 
            autoClose: 10000 
        });
      }
      
      fetchUsers();
      setOpened(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleStatusChange = (userId: number, newStatus: UserStatus) => {
    apiService.updateUserStatus(userId, newStatus).then(() => {
      const actionKey = newStatus === 'ativo' ? 'users.messages.activated' : 'users.messages.deactivated';
      notifications.show({ 
          title: t('common.success'), 
          message: t(actionKey), 
          color: newStatus === 'ativo' ? 'green' : 'gray', 
          icon: <IconCheck/> 
      });
      fetchUsers();
    });
  };
  
  const handleReject = async (userId: number) => {
    if(confirm(t('users.confirmReject'))) {
        try {
            await apiService.deleteAccount(userId);
            notifications.show({ 
                title: t('users.status.rejected'), 
                message: t('users.messages.rejected'), 
                color: 'gray' 
            });
            fetchUsers();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        } catch(err: any) {
            notifications.show({ 
                title: t('common.error'), 
                message: t('users.messages.rejectError'), 
                color: 'red' 
            });
        }
    }
  };

  const rows = users.map((user) => (
    <Table.Tr key={user.id_usuario}>
      <Table.Td>{user.nome}</Table.Td>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td style={{ textTransform: "capitalize" }}>
        {t(`users.levels.${user.nivel_acesso}`)}
      </Table.Td>
      <Table.Td>
        <Badge color={statusColors[user.status]} variant="light">
          {t(`users.status.${user.status}`)}
        </Badge>
      </Table.Td>
      <Table.Td>{new Date(user.data_cadastro).toLocaleDateString()}</Table.Td>
      <Table.Td>
        <Group gap={4}>
          <Tooltip label={t('common.edit')}>
            <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleOpenModal(user)}>
              <IconPencil size={14} />
            </ActionIcon>
          </Tooltip>

          {user.status === 'ativo' && (
            <Tooltip label={t('users.actions.disable')}>
              <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleStatusChange(user.id_usuario, 'inativo')}>
                <IconBan size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {user.status === 'inativo' && (
            <Tooltip label={t('users.actions.activate')}>
              <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleStatusChange(user.id_usuario, 'ativo')}>
                <IconCheck size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {user.status === "pendente" && (
            <>
              <Tooltip label={t('users.actions.approve')}>
                <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleStatusChange(user.id_usuario, 'ativo')}>
                  <IconCheck size={14} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t('users.actions.reject')}>
                <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleReject(user.id_usuario)}>
                  <IconX size={14} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Title order={2} c="orange.7">
          {t('users.title')}
        </Title>
        <Button bg="orange.6" leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal(null)}>
          {t('users.create')}
        </Button>
      </Group>

      <Paper p="md" withBorder shadow="md" radius="md">
        {loading ? (
          <Center h={200}><Loader color="orange" /></Center>
        ) : (
          <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('users.table.name')}</Table.Th>
                <Table.Th>{t('users.table.email')}</Table.Th>
                <Table.Th>{t('users.table.level')}</Table.Th>
                <Table.Th>{t('users.table.status')}</Table.Th>
                <Table.Th>{t('users.table.created')}</Table.Th>
                <Table.Th>{t('users.table.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" py="xl">{t('users.empty')}</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal 
        opened={opened} 
        onClose={() => setOpened(false)} 
        title={editingUser ? t('users.modal.editTitle') : t('users.modal.createTitle')} 
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label={t('users.modal.name')}
              placeholder={t('users.modal.namePlaceholder')}
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label={t('users.modal.email')}
              placeholder="joao@example.com"
              required
              {...form.getInputProps("email")}
            />
            
            <PasswordInput 
              label={editingUser ? t('users.modal.passwordReset') : t('users.modal.passwordInitial')}
              description={editingUser ? t('users.modal.passwordHelpEdit') : t('users.modal.passwordHelpCreate')}
              placeholder={editingUser ? t('users.modal.passwordPlaceholderEdit') : "******"} 
              {...form.getInputProps("password")} 
            />

            <Select
              label={t('users.modal.level')}
              placeholder={t('common.select')}
              data={[
                { value: "operador", label: t('users.levels.operador') },
                { value: "visualizador", label: t('users.levels.visualizador') },
                { value: "admin", label: t('users.levels.admin') },
              ]}
              required
              {...form.getInputProps("level")}
            />
            <Button fullWidth bg="orange.6" type="submit" loading={modalLoading}>
              {editingUser ? t('common.save') : t('users.create')}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}