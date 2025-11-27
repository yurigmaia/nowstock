/**
 * @component UsersView
 * @description
 * Tela de administração para Gerenciamento de Usuários (CRUD).
 * Permite ao admin visualizar a lista de usuários, aprovar pendentes,
 * bloquear/desativar existentes e incluir novos usuários manualmente.
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
import type { User, UserStatus } from '../types/entities';

const statusColors: Record<UserStatus, string> = {
  ativo: 'green',
  pendente: 'orange',
  inativo: 'gray',
};

export function UsersView() {
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
      name: (value) => (value.trim().length > 0 ? null : "Nome obrigatório"),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Email inválido"),
      password: (value) => {
        if (!editingUser && value.length < 6) return "Senha obrigatória (mín 6 chars)";
        if (editingUser && value.length > 0 && value.length < 6) return "Nova senha muito curta";
        return null;
      },
    },
  });

  const fetchUsers = () => {
    setLoading(true);
    apiService.getUsers()
      .then(setUsers)
      .catch((err) => notifications.show({ title: 'Erro', message: err.message, color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user: User | null) => {
    setEditingUser(user);
    if (user) {
      form.setValues({
        name: user.nome,
        email: user.email,
        password: "",
        level: user.nivel_acesso,
      });
    } else {
      form.reset();
    }
    setOpened(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    setModalLoading(true);
    try {
      if (editingUser) {
        await apiService.adminUpdateUser(editingUser.id_usuario, {
            nome: values.name,
            email: values.email,
            nivel_acesso: values.level,
            status: editingUser.status
        });
        notifications.show({ title: 'Sucesso', message: 'Usuário atualizado.', color: 'green' });
      } else {
        await apiService.createUser({
          name: values.name,
          email: values.email,
          password: values.password,
          level: values.level,
        });
        notifications.show({ title: 'Sucesso', message: 'Usuário criado.', color: 'green' });
      }
      
      fetchUsers();
      setOpened(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      notifications.show({ title: 'Erro', message: err.message, color: 'red' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = (userId: number, newStatus: UserStatus) => {
    apiService.updateUserStatus(userId, newStatus).then(() => {
      const action = newStatus === 'ativo' ? 'ativado' : 'desativado';
      notifications.show({ 
          title: 'Status Atualizado', 
          message: `Usuário ${action} com sucesso.`, 
          color: newStatus === 'ativo' ? 'green' : 'gray', 
          icon: <IconCheck/> 
      });
      fetchUsers();
    });
  };
  
  const handleReject = async (userId: number) => {
    if(confirm("Tem certeza que deseja rejeitar (excluir) a solicitação deste usuário?")) {
        try {
            await apiService.deleteAccount(userId);
            notifications.show({ title: 'Rejeitado', message: 'Solicitação removida.', color: 'gray' });
            fetchUsers();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch(err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            notifications.show({ title: 'Erro', message: 'Falha ao rejeitar.', color: 'red' });
        }
    }
  };

  const rows = users.map((user) => (
    <Table.Tr key={user.id_usuario}>
      <Table.Td>{user.nome}</Table.Td>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td style={{ textTransform: "capitalize" }}>
        {user.nivel_acesso}
      </Table.Td>
      <Table.Td>
        <Badge color={statusColors[user.status]} variant="light">
          {user.status}
        </Badge>
      </Table.Td>
      <Table.Td>{new Date(user.data_cadastro).toLocaleDateString('pt-BR')}</Table.Td>
      <Table.Td>
        <Group gap={4}>
          <Tooltip label="Editar">
            <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleOpenModal(user)}>
              <IconPencil size={14} />
            </ActionIcon>
          </Tooltip>

          {user.status === 'ativo' && (
            <Tooltip label="Desativar Usuário">
              <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleStatusChange(user.id_usuario, 'inativo')}>
                <IconBan size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {user.status === 'inativo' && (
            <Tooltip label="Reativar Usuário">
              <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleStatusChange(user.id_usuario, 'ativo')}>
                <IconCheck size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {user.status === "pendente" && (
            <>
              <Tooltip label="Aprovar Acesso">
                <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleStatusChange(user.id_usuario, 'ativo')}>
                  <IconCheck size={14} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Rejeitar Solicitação">
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
          Gestão de Usuários
        </Title>
        <Button bg="orange.6" leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal(null)}>
          Incluir Usuário
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
                <Table.Th>Email</Table.Th>
                <Table.Th>Nível</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Cadastro</Table.Th>
                <Table.Th>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" py="xl">Nenhum usuário encontrado.</Text>
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
        title={editingUser ? "Editar Usuário" : "Incluir Usuário"} 
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nome"
              placeholder="João Silva"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Email"
              placeholder="joao@example.com"
              required
              {...form.getInputProps("email")}
            />
            <PasswordInput 
              label={editingUser ? "Nova Senha (Opcional)" : "Senha"}
              placeholder="******" 
              {...form.getInputProps("password")} 
            />
            <Select
              label="Nível de Acesso"
              placeholder="Selecione um nível"
              data={[
                { value: "operador", label: "Operador" },
                { value: "visualizador", label: "Visualizador" },
              ]}
              required
              {...form.getInputProps("level")}
            />
            <Button fullWidth bg="orange.6" type="submit" loading={modalLoading}>
              {editingUser ? "Salvar Alterações" : "Criar Usuário"}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}