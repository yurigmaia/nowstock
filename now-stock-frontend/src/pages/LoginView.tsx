import { useState, useEffect } from "react";
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
} from "@mantine/core";

const backgroundImages = [
  "src/assets/backgrounds/1.png",
  "src/assets/backgrounds/2.jpg",
  "src/assets/backgrounds/3.jpg",
  "src/assets/backgrounds/4.jpg",
];

export function LoginView() {
  const { t } = useTranslation();
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBgImage(backgroundImages[randomIndex]);
  }, []);

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length >= 6 ? null : "Password must have at least 6 characters",
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log("Login attempt with:", values);
  };

  return (
    <Box
      style={{
        height: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "0 5%",
      }}
    >
      <Container size={460}>
        <Paper
          p={30}
          radius="md"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Title order={1} c="white" mb={5}>
            NowStock
          </Title>
          <Title order={2} c="white">
            {t("login.title")}
          </Title>
          <Text c="dimmed" size="sm" mt="xs" mb={30}>
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
            <Button type="submit" fullWidth mt="xl" size="md">
              {t("login.button")}
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
          <Group justify="space-between" align="center">
            <div>
              <Title order={4} c="white">
                {t("signup.title")}
              </Title>
              <Text c="dimmed" size="xs">
                {t("signup.subtitle")}
              </Text>
            </div>
            <Box bg="orange" p="sm" style={{ borderRadius: "50%" }}>
              <IconUserPlus style={{ color: "white" }} />
            </Box>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}
