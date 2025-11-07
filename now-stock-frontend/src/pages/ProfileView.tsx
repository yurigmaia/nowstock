/**
 * @component ProfileView
 * @description
 * Tela onde o usuário logado pode gerenciar suas informações de perfil,
 * alterar sua senha e excluir sua própria conta.
 * Utiliza o AuthContext para obter os dados do usuário atual.
 */
import {
  Box,
  Title,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Group,
  Modal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useAuth } from '../hooks/useAuth';
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { useState } from "react";

export function ProfileView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const profileForm = useForm({
    initialValues: {
      name: user?.nome || '',
      email: user?.email || '',
    },
    validate: {
      name: (value) => (value.trim().length < 3 ? 'Nome completo deve ter 3+ caracteres' : null),
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'E-mail inválido'),
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (value) => (
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}/.test(value)
          ? null
          : 'A nova senha não atende os requisitos'
      ),
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'As senhas não coincidem' : null,
    },
  });

  const handleProfileSubmit = async (values: typeof profileForm.values) => {
    if (!user) return;
    setLoadingProfile(true);
    try {
      await apiService.updateProfile(user.id, { nome: values.name, email: values.email });
      notifications.show({ title: 'Sucesso', message: 'Perfil atualizado.', color: 'green', icon: <IconCheck/> });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      notifications.show({ title: 'Erro', message: err.message, color: 'red', icon: <IconX/> });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoadingDelete(true);
    try {
      await apiService.deleteAccount(user.id);
      notifications.show({ title: 'Conta Excluída', message: 'Sua conta foi removida.', color: 'gray' });
      logout();
      navigate('/login');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      notifications.show({ title: 'Erro', message: err.message, color: 'red', icon: <IconX/> });
    } finally {
      setLoadingDelete(false);
      closeDeleteModal();
    }
  };

  const handlePasswordSubmit = async (values: typeof passwordForm.values) => {
    setLoadingPassword(true);
    console.log("MOCK: Mudando senha", values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingPassword(false);
    passwordForm.reset();
  };


  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">
        Meu Perfil
      </Title>

      <Paper p="md" withBorder shadow="md" radius="md" maw={600}>
        <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
          <Stack gap="md">
            <Title order={4} c="dimmed">Informações</Title>
            <TextInput
              label="Nome Completo"
              required
              {...profileForm.getInputProps('name')}
            />
            <TextInput
              label="E-mail"
              required
              {...profileForm.getInputProps('email')}
            />
            <Button type="submit" bg="orange.6" mt="md" style={{ alignSelf: 'flex-start' }} loading={loadingProfile}>
              Salvar Alterações
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper p="md" withBorder shadow="md" radius="md" maw={600} mt="xl">
        <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
          <Stack gap="md">
            <Title order={4} c="dimmed">Alterar Senha</Title>
            <PasswordInput
              label="Senha Atual"
              required
              {...passwordForm.getInputProps('currentPassword')}
            />
            <PasswordInput
              label="Nova Senha"
              placeholder="Mín. 6 caracteres, 1 maiúscula, 1 número, 1 especial"
              required
              {...passwordForm.getInputProps('newPassword')}
            />
            <PasswordInput
              label="Confirmar Nova Senha"
              required
              {...passwordForm.getInputProps('confirmPassword')}
            />
            <Button type="submit" bg="orange.6" mt="md" style={{ alignSelf: 'flex-start' }} loading={loadingPassword}>
              Atualizar Senha
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper p="md" withBorder shadow="md" radius="md" maw={600} mt="xl" style={{ borderColor: 'var(--mantine-color-red-6)' }}>
        <Stack gap="md">
          <Title order={4} c="red.6">Zona de Perigo</Title>
          <Text size="sm">Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e todos os seus dados.</Text>
          <Button
            color="red"
            variant="outline"
            leftSection={<IconAlertTriangle size={16} />}
            onClick={openDeleteModal}
            style={{ alignSelf: 'flex-start' }}
            loading={loadingDelete}
          >
            Deletar minha conta
          </Button>
        </Stack>
      </Paper>

      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Confirmar Exclusão" centered>
        <Text>Você tem certeza que deseja deletar sua conta permanentemente? Todos os seus dados serão perdidos.</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeDeleteModal}>
            Cancelar
          </Button>
          <Button color="red" onClick={handleDeleteAccount} loading={loadingDelete}>
            Sim, deletar conta
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}