import { useEffect, useState } from "react"; // <-- Adicionado useState
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { IconUserPlus } from "@tabler/icons-react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Box,
  Center,
  Alert, // <-- Adicionado Alert para exibir mensagens
} from "@mantine/core";

import { Link, useNavigate } from "react-router-dom"; // <-- Adicionado useNavigate para redirecionar

import { LanguageSwitcher } from "../components/common/LanguageSwitcher";
import Logo from "../assets/textlogo.svg?react";
import bg1 from "../assets/backgrounds/1.png";
import bg2 from "../assets/backgrounds/2.jpg";
import bg3 from "../assets/backgrounds/3.jpg";
import bg4 from "../assets/backgrounds/4.jpg";

import { login } from "../services/authService.js"; 

const backgroundImages = [bg1, bg2, bg3, bg4];

export function LoginView() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // <-- Hook de navegação

  // --- NOVOS ESTADOS PARA A INTEGRAÇÃO ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ... (lógica de fundo) ...
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
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t("validation.email")),
      password: (value) =>
        value.length >= 6 ? null : t("validation.passwordLength"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    // 1. Limpa o erro e ativa o loading
    setError(null);
    setLoading(true);

    try {
      // 2. CHAMA A FUNÇÃO DE LOGIN
      // Nota: o campo 'password' do front mapeia para 'senha' no back
      const userData = await login(values.email, values.password);

      console.log("Login bem-sucedido:", userData);

      // 3. Redireciona para a rota principal após o sucesso
      // Você deve decidir qual é a rota principal do seu sistema
      navigate("/dashboard");

    } catch (err: any) {
      // 4. Captura e exibe a mensagem de erro do backend (ex: "E-mail ou senha inválidos.")
      console.error("Erro na autenticação:", err.message);
      setError(err.message || t("login.genericError"));
    } finally {
      // 5. Desativa o loading
      setLoading(false);
    }
  };

  return (
    <Box style={{ minHeight: "100vh", position: "relative" }}>
      <Box style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
        <LanguageSwitcher />
      </Box>
      <Center style={{ height: "100vh", padding: "0 5%" }}>
        <Container size={460} w="100%">
          {/* Alerta de erro aqui, logo acima do formulário */}
          {error && (
            <Alert title={t("common.error")} color="red" mb="md">
              {error}
            </Alert>
          )}

          <Paper
            p={30}
            radius="md"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0)",
            }}
          >
            <Container style={{ display: "flex", justifyContent: "center" }}>
              <Logo
                style={{ width: "250px", marginBottom: "20px", color: "white" }}
              />
            </Container>
            <Title order={2} c="white">
              {t("login.title")}
            </Title>
            <Text c="#c2c2c2" size="sm" mt="xs" mb={30}>
              {t("login.subtitle")}
            </Text>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label={t("login.emailLabel")}
                placeholder={t("login.emailPlaceholder")}
                required
                {...form.getInputProps("email")}
                styles={{ label: { color: "white" } }}
              />
              <PasswordInput
                label={t("login.passwordLabel")}
                placeholder="******"
                required
                mt="md"
                {...form.getInputProps("password")}
                styles={{ label: { color: "white" } }}
              />
              {/* Adicionando o prop 'loading' ao botão */}
              <Button type="submit" fullWidth mt="xl" size="md" loading={loading} disabled={loading}> 
                {t("login.button")}
              </Button>
            </form>
          </Paper>
          <Link to="/signup" style={{ textDecoration: "none" }}>
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
              <Group justify="space-between" align="center">
                <div>
                  <Title order={4} c="white">
                    {t("signup.title")}
                  </Title>
                  <Text c="#c2c2c2" size="xs">
                    {t("signup.subtitle")}
                  </Text>
                </div>
                <Box bg="orange" p="sm" style={{ borderRadius: "10%" }}>
                  <IconUserPlus style={{ color: "white" }} />
                </Box>
              </Group>
            </Paper>
          </Link>
        </Container>
      </Center>
    </Box>
  );
}
