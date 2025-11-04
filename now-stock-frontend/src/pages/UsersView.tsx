/**
 * @component UsersView
 * @description
 * Tela de administração para Gerenciamento de Usuários (CRUD).
 * Permite ao admin visualizar a lista de usuários, aprovar pendentes,
 * bloquear/editar existentes e incluir novos usuários manualmente através de um modal.
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
  IconCheck, IconX, IconLock, IconPlus,
  IconPencil
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

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      level: "operador",
    },
    validate: {
      name: (value) => (value.length > 0 ? null : "Nome obrigatório"),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Email inválido"),
      password: (value) => (value.length > 0 ? null : "Senha obrigatória"),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddUser = async (values: any) => {
    setModalLoading(true);
    try {
      await apiService.createUser({
        name: values.name,
        email: values.email,
        password: values.password,
        level: values.level,
      });
      notifications.show({ title: 'Sucesso', message: 'Usuário incluído manualmente.', color: 'green' });
      fetchUsers();
      form.reset();
      setOpened(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      notifications.show({ title: 'Erro', message: err.message, color: 'red' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleApprove = (userId: number) => {
    apiService.updateUserStatus(userId, 'ativo').then(() => {
      notifications.show({ title: 'Usuário Aprovado', message: 'O usuário agora está ativo.', color: 'green', icon: <IconCheck/> });
      fetchUsers();
    });
  };

  const handleBlock = (userId: number) => {
    apiService.updateUserStatus(userId, 'inativo').then(() => {
      notifications.show({ title: 'Usuário Bloqueado', message: 'O usuário foi movido para inativo.', color: 'gray', icon: <IconLock/> });
      fetchUsers();
    });
  };
  
  const handleReject = (userId: number) => {
    console.log("Rejeitando/Excluindo usuário:", userId);
  };
  
  const handleEdit = (user: User) => {
    console.log("Editando usuário:", user);
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
            <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleEdit(user)}>
              <IconPencil size={14} />
            </ActionIcon>
          </Tooltip>
          {user.status === 'ativo' && (
            <Tooltip label="Bloquear">
              <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleBlock(user.id_usuario)}>
                <IconLock size={14} />
              </ActionIcon>
            </Tooltip>
          )}
          {user.status === "pendente" && (
            <>
              <Tooltip label="Aprovar">
                <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleApprove(user.id_usuario)}>
                  <IconCheck size={14} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Rejeitar">
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
        <Button bg="orange.6" leftSection={<IconPlus size={16} />} onClick={() => setOpened(true)}>
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
                <Table.Th>Nível de Acesso</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Data de Cadastro</Table.Th>
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

      <Modal opened={opened} onClose={() => setOpened(false)} title="Incluir Usuário" centered>
        <form onSubmit={form.onSubmit(handleAddUser)}>
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
              label="Senha" 
              placeholder="******" 
              required 
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
              Criar Usuário
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}