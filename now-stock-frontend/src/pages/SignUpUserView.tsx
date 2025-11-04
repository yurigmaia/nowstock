/**
 * @component SignUpUserView
 * @description
 * Tela pública para um novo usuário (operador) solicitar acesso a uma
 * empresa já cadastrada. O formulário coleta o CNPJ da empresa,
 * dados do usuário e envia para a API. O status do usuário ficará
 * 'pendente' até ser aprovado por um administrador.
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
  Alert,
  Anchor,
} from "@mantine/core";
import { IconInfoCircle, IconX } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useNavigate, Link } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { registerUser } from "../services/authService";

export function SignUpUserView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    initialValues: {
      cnpj: "",
      fullName: "",
      email: "",
      password: "",
    },
    validate: {
      cnpj: (value) => (
        /^\d{14}$/.test(value.replace(/[^\d]/g, '')) ? null : 'O CNPJ da empresa deve conter 14 dígitos'
      ),
      fullName: (value) => (value.trim().length < 3 ? 'Nome completo deve ter 3+ caracteres' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'E-mail inválido'),
      password: (value) => (value.length >= 6 ? null : "Senha deve ter no mínimo 6 caracteres"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const payload = {
        cnpj_empresa: values.cnpj.replace(/[^\d]/g, ''),
        nome_usuario: values.fullName,
        email: values.email,
        senha: values.password,
      };
      
      await registerUser(payload);
      setSubmitted(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      notifications.show({
        title: 'Falha na Solicitação',
        message: error.message || 'Não foi possível completar a solicitação.',
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
      <Paper
        p={30}
        radius="md"
        style={{
          width: "100%",
          maxWidth: 450,
          background: "rgba(30, 30, 30, 0.72)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Title order={2} c="white" mb={8}>
          Solicitar Acesso
        </Title>
        <Text c="dimmed" size="sm" mb={24}>
          Preencha os dados para solicitar acesso ao sistema
        </Text>

        {submitted ? (
          <Alert
            icon={<IconInfoCircle />}
            title="Solicitação Enviada!"
            color="orange"
            radius="md"
          >
            <Text mb="md">Sua solicitação foi registrada e está pendente de aprovação do administrador.</Text>
            <Button 
              variant="light" 
              color="orange" 
              fullWidth
              onClick={() => navigate('/login')}
            >
              Voltar para o Login
            </Button>
          </Alert>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="CNPJ da Empresa"
                placeholder="00000000000000"
                maxLength={14}
                required
                {...form.getInputProps("cnpj")}
                styles={{ label: { color: "white" } }}
              />
              <TextInput
                label="Nome Completo"
                placeholder="Seu nome"
                required
                {...form.getInputProps("fullName")}
                styles={{ label: { color: "white" } }}
              />
              <TextInput
                label="E-mail"
                placeholder="seu@email.com"
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
              <Button fullWidth bg="orange.6" c="white" type="submit" loading={loading}>
                Solicitar Acesso
              </Button>
            </Stack>
          </form>
        )}
      </Paper>
      
      {!submitted && (
        <Anchor component={Link} to="/login" c="dimmed" size="sm" mt="md">
          Voltar para o Login
        </Anchor>
      )}
    </Box>
  );
}