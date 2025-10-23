import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
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
  Divider,
  Anchor,
} from '@mantine/core';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { useNavigate, Link } from 'react-router-dom';

export function CompanySignUpView() {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      companyName: '',
      cnpj: '',
      adminName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      companyName: (value) => (value.trim().length < 2 ? 'Company name is too short' : null),
      cnpj: (value) => (
        /^\d{14}$/.test(value.replace(/[^\d]/g, '')) ? null : t('signupPage.errors.cnpjLength')
      ),
      adminName: (value) =>
        value.trim().length < 3 ? 'Full name must have at least 3 characters' : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}/.test(value)
          ? null
          : t('signupPage.errors.passwordRequirements')
      ),
      confirmPassword: (value, values) =>
        value !== values.password ? t('signupPage.errors.passwordMismatch') : null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log('New company and admin data:', {
      companyName: values.companyName,
      cnpj: values.cnpj,
      adminName: values.adminName,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Box bg="dark.8" style={{ minHeight: '100vh', paddingTop: 40, paddingBottom: 40 }}>
      <Box style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <LanguageSwitcher />
      </Box>
      <Center>
        <Container size={500} w="100%">
          <Title ta="center" c="white">
            {t('companySignupPage.title')}
          </Title>
          <Text c="dimmed" size="sm" ta="center" mt={5}>
            {t('companySignupPage.subtitle')}
          </Text>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Title order={4} c="dimmed" tt="uppercase" fz="xs" fw={700}>
                {t('companySignupPage.companyData')}
              </Title>
              <TextInput
                label={t('companySignupPage.companyNameLabel')}
                placeholder="Nome da sua empresa"
                required
                mt="md"
                {...form.getInputProps('companyName')}
              />
              <TextInput
                label={t('companySignupPage.cnpjLabel')}
                placeholder="Apenas números"
                required
                mt="md"
                maxLength={14}
                {...form.getInputProps('cnpj')}
              />

              <Divider my="lg" />

              <Title order={4} c="dimmed" tt="uppercase" fz="xs" fw={700}>
                {t('companySignupPage.adminData')}
              </Title>
              <TextInput
                label={t('companySignupPage.adminNameLabel')}
                placeholder="Seu nome completo"
                required
                mt="md"
                {...form.getInputProps('adminName')}
              />
              <TextInput
                label={t('companySignupPage.emailLabel')}
                placeholder={t('companySignupPage.emailPlaceholder')}
                required
                mt="md"
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label={t('companySignupPage.passwordLabel')}
                placeholder="******"
                required
                mt="md"
                {...form.getInputProps('password')}
              />
              <PasswordInput
                label={t('companySignupPage.confirmPasswordLabel')}
                placeholder="******"
                required
                mt="md"
                {...form.getInputProps('confirmPassword')}
              />

              <Button type="submit" fullWidth mt="xl">
                {t('companySignupPage.button')}
              </Button>
            </form>
          </Paper>

          <Text ta="center" mt="md" size="sm" c="dimmed">
            Already have an account?{' '}
            <Anchor component={Link} to="/login" c="orange">
              Sign in
            </Anchor>
          </Text>
        </Container>
      </Center>
    </Box>
  );
}