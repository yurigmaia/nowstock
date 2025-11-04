/**
 * @component CompanySignUpView
 * @description
 * Tela de cadastro inicial para um novo cliente (Empresa + Administrador).
 * Coleta dados da empresa e do usuário admin, valida-os e os envia
 * para a rota de 'register-initial' no backend.
 */
import { useState } from "react";
import {
  Box,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Divider,
  Anchor,
  Center,
  Container,
} from "@mantine/core";
import { IconX, IconCheck } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useNavigate, Link } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { registerInitial } from "../services/authService";

export function CompanySignUpView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      companyName: "",
      cnpj: "",
      adminName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      companyName: (value) => (value.trim().length < 2 ? 'Nome da empresa muito curto' : null),
      cnpj: (value) => (
        /^\d{14}$/.test(value.replace(/[^\d]/g, '')) ? null : 'O CNPJ deve conter 14 dígitos'
      ),
      adminName: (value) => (value.trim().length < 3 ? 'Nome completo deve ter 3+ caracteres' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'E-mail inválido'),
      password: (value) => (
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}/.test(value)
          ? null
          : 'A senha precisa de 6+ caracteres, 1 maiúscula, 1 número e 1 caractere especial.'
      ),
      confirmPassword: (value, values) =>
        value !== values.password ? 'As senhas não coincidem' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const payload = {
        nome_empresa: values.companyName,
        cnpj: values.cnpj.replace(/[^\d]/g, ''),
        nome_usuario: values.adminName,
        email: values.email,
        senha: values.password,
      };

      await registerInitial(payload);

      notifications.show({
        title: 'Cadastro Realizado!',
        message: 'Sua empresa e usuário foram criados com sucesso. Faça o login.',
        color: 'green',
        icon: <IconCheck />,
      });
      navigate('/login');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      notifications.show({
        title: 'Erro no Cadastro',
        message: error.message || 'Não foi possível completar o cadastro.',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        position: "relative",
      }}
    >
      <Center>
        <Container size={500} w="100%">
          <Title ta="center" c="white">
            Crie sua conta
          </Title>
          <Text c="dimmed" size="sm" ta="center" mt={5}>
            É rápido e fácil
          </Text>

          <Paper
            p={30}
            withBorder
            radius="md"
            style={{
              width: "100%",
              maxWidth: 500,
              background: "rgba(30, 30, 30, 0.72)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginTop: 30,
            }}
          >
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <div>
                  <Title order={3} c="orange.6" mb={16}>
                    Dados da Empresa
                  </Title>
                  <Stack gap="md">
                    <TextInput
                      label="Nome da Empresa"
                      placeholder="Sua empresa"
                      required
                      {...form.getInputProps("companyName")}
                      styles={{ label: { color: "white" } }}
                    />
                    <TextInput
                      label="CNPJ"
                      placeholder="00000000000000"
                      maxLength={14}
                      required
                      {...form.getInputProps("cnpj")}
                      styles={{ label: { color: "white" } }}
                    />
                  </Stack>
                </div>

                <Divider />

                <div>
                  <Title order={3} c="orange.6" mb={16}>
                    Dados do Administrador
                  </Title>
                  <Stack gap="md">
                    <TextInput
                      label="Nome Completo"
                      placeholder="João Silva"
                      required
                      {...form.getInputProps("adminName")}
                      styles={{ label: { color: "white" } }}
                    />
                    <TextInput
                      label="E-mail"
                      placeholder="admin@email.com"
                      required
                      {...form.getInputProps("email")}
                      styles={{ label: { color: "white" } }}
                    />
                    <PasswordInput
                      label="Senha"
                      placeholder="******"
                      required
                      {...form.getInputProps("password")}
                      styles={{ label: { color: "white" } }}
                    />
                    <PasswordInput
                      label="Confirme sua Senha"
                      placeholder="******"
                      required
                      {...form.getInputProps("confirmPassword")}
                      styles={{ label: { color: "white" } }}
                    />
                  </Stack>
                </div>

                <Button fullWidth bg="orange.6" c="white" type="submit" loading={loading}>
                  Criar Conta
                </Button>
              </Stack>
            </form>
          </Paper>
          
          <Text ta="center" mt="md" size="sm" c="dimmed">
            Já tem uma conta?{' '}
            <Anchor component={Link} to="/login" c="orange">
              Entrar
            </Anchor>
          </Text>
        </Container>
      </Center>
    </Box>
  );
}