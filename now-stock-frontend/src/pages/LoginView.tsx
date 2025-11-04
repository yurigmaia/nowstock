/**
 * @component LoginView
 * @description
 * Tela de login principal da aplicação. Permite ao usuário se autenticar,
 * exibe um fundo dinâmico e links para as telas de cadastro.
 * Conecta-se ao 'authService' para validação e ao 'AuthContext' para
 * gerenciar o estado de autenticação global.
 */
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { IconX } from "@tabler/icons-react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Box,
  Center,
  Alert,
  Stack,
  Anchor,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/textlogo.svg?react";
import bg1 from "../assets/backgrounds/1.png";
import bg2 from "../assets/backgrounds/2.jpg";
import bg3 from "../assets/backgrounds/3.jpg";
import bg4 from "../assets/backgrounds/4.jpg";
import { login as apiLogin } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { notifications } from "@mantine/notifications";

const backgroundImages = [bg1, bg2, bg3, bg4];

export function LoginView() {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    const selectedImage = backgroundImages[randomIndex];
    document.body.style.backgroundImage = `url(${selectedImage})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.height = "";
      document.body.style.overflow = "";
    };
  }, []);

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "E-mail inválido"),
      password: (value) =>
        value.length >= 6 ? null : "A senha deve ter pelo menos 6 caracteres",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiLogin(values.email, values.password);
      contextLogin(response.token, response.user);
      navigate("/");

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro inesperado.";
      console.error("Erro na autenticação:", errorMessage);
      setError(errorMessage);
      notifications.show({
        title: 'Erro de Autenticação',
        message: errorMessage,
        color: 'red',
        icon: <IconX size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ minHeight: "100vh", position: "relative" }}>
      <Center style={{ height: "100vh", padding: "0 5%" }}>
        <Container size={460} w="100%">
          {error && (
            <Alert title="Erro" color="red" mb="md" withCloseButton onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Paper
            p={30}
            radius="md"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Container style={{ display: "flex", justifyContent: "center" }}>
              <Logo
                style={{ width: "250px", marginBottom: "20px", color: "white" }}
              />
            </Container>
            <Title order={2} c="white">
              Login
            </Title>
            <Text c="#c2c2c2" size="sm" mt="xs" mb={30}>
              Preencha os campos para efetuar o login
            </Text>

            <form onSubmit={form.onSubmit(handleSubmit)}>
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
                mt="md"
                {...form.getInputProps("password")}
                styles={{ label: { color: "white" } }}
              />
              <Button type="submit" fullWidth mt="xl" size="md" loading={loading} disabled={loading}>
                Entrar
              </Button>
            </form>
          </Paper>

          <Paper
            p="md"
            mt="lg"
            radius="md"
            withBorder
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(10px)",
              cursor: "pointer",
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <Stack align="center" gap="xs">
              <Anchor component={Link} to="/signup-company" type="button" c="dimmed" size="xs">
                Cadastrar Empresa
              </Anchor>
              <Anchor component={Link} to="/signup-user" type="button" c="dimmed" size="xs">
                Solicitar Acesso de Usuário
              </Anchor>
            </Stack>
          </Paper>
        </Container>
      </Center>
    </Box>
  );
}