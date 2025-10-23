// src/pages/SignUpView.tsx
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
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
  Space,
} from "@mantine/core";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";

export function SignUpView() {
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      companyName: "",
      cnpj: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
      companyName: (value) =>
        value.length < 2 ? "Company name is too short" : null,
      cnpj: (value) =>
        /^\d{14}$/.test(value) ? null : t("signupPage.errors.cnpjLength"),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}/.test(
          value
        )
          ? null
          : t("signupPage.errors.passwordRequirements"),
      confirmPassword: (value, values) =>
        value !== values.password
          ? t("signupPage.errors.passwordMismatch")
          : null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log("Sign up attempt with:", values);
  };

  return (
    <Box
      bg="dark.8"
      style={{ minHeight: "100vh", paddingTop: 40, paddingBottom: 40 }}
    >
      <Box style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
        <LanguageSwitcher />
      </Box>
      <Center>
        <Container size={460} w="100%">
          <Title ta="center" c="white">
            {t("signupPage.title")}
          </Title>
          <Text c="dimmed" size="sm" ta="center" mt={5}>
            {t("signupPage.subtitle")}
          </Text>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label={t("signupPage.companyNameLabel")}
                placeholder="Sua empresa"
                required
                {...form.getInputProps("companyName")}
              />
              <Space h="md" />
              <TextInput
                label={t("signupPage.cnpjLabel")}
                placeholder="00.000.000/0000-00"
                required
                {...form.getInputProps("cnpj")}
              />
              <Space h="md" />
              <TextInput
                label={t("signupPage.emailLabel")}
                placeholder="seu@email.com"
                required
                {...form.getInputProps("email")}
              />
              <Space h="md" />
              <PasswordInput
                label={t("signupPage.passwordLabel")}
                placeholder="Sua senha"
                required
                {...form.getInputProps("password")}
              />
              <Space h="md" />
              <PasswordInput
                label={t("signupPage.confirmPasswordLabel")}
                placeholder="Confirme sua senha"
                required
                {...form.getInputProps("confirmPassword")}
              />

              <Button type="submit" fullWidth mt="xl">
                {t("signupPage.button")}
              </Button>
            </form>
          </Paper>
        </Container>
      </Center>
    </Box>
  );
}
