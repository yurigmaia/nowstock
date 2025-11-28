/**
 * @component ProfileView
 * @description
 * Tela onde o usuário logado pode gerenciar suas informações de perfil
 * e alterar sua senha.
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
  Center,
  Loader,
  Divider,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useAuth } from '../hooks/useAuth';
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { apiService } from "../services/api";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export function ProfileView() {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user, setUser } = useAuth() as any;
  
  const [loading, setLoading] = useState(false);

  const mainForm = useForm({
    initialValues: {
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => (value.trim().length < 3 ? t('validation.nameShort') : null),
      newPassword: (value) => {
        if (!value) return null; 
        return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}/.test(value)
          ? null
          : t('profile.errors.passwordRequirements');
      },
      confirmPassword: (value, values) => {
        if (!values.newPassword) return null;
        return value !== values.newPassword ? t('profile.errors.passwordMismatch') : null;
      },
      currentPassword: (value, values) => {
        if (values.newPassword && !value) return t('common.required'); 
        return null;
      }
    },
  });

  useEffect(() => {
    if (user) {
      mainForm.setValues({
        name: user.nome || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSave = async (values: typeof mainForm.values) => {
    if (!user) return;
    setLoading(true);

    try {
      await apiService.updateProfile(user.id, { 
        nome: values.name, 
        email: values.email 
      });

      const updatedUser = { ...user, nome: values.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (setUser) {
        setUser(updatedUser);
      }

      if (values.newPassword && values.currentPassword) {
        await apiService.changePassword(user.id, {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        });
      }
      
      notifications.show({ 
        title: t('common.success'), 
        message: t('profile.updateSuccess'), 
        color: 'green', 
        icon: <IconCheck/> 
      });

      mainForm.setFieldValue('currentPassword', '');
      mainForm.setFieldValue('newPassword', '');
      mainForm.setFieldValue('confirmPassword', '');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      notifications.show({ 
        title: t('common.error'), 
        message: err.message || t('profile.updateError'), 
        color: 'red', 
        icon: <IconX/> 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
     return <Center h="50vh"><Loader color="orange" /></Center>;
  }

  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">
        {t('profile.title')}
      </Title>

      <Paper p="md" withBorder shadow="md" radius="md" maw={600}>
        <form onSubmit={mainForm.onSubmit(handleSave)}>
          <Stack gap="md">
            
            <Title order={4} c="dimmed">{t('profile.infoTitle')}</Title>
            
            <TextInput
              label={t('profile.nameLabel')}
              required
              {...mainForm.getInputProps('name')}
            />

            <TextInput
              label={t('profile.emailLabel')}
              disabled
              description={t('profile.emailReadOnlyDescription')}
              {...mainForm.getInputProps('email')}
            />

            <Divider label={t('profile.securitySection')} labelPosition="center" my="sm" />

            <Text size="sm" c="dimmed">
              {t('profile.passwordChangeDescription')}
            </Text>

            <PasswordInput
              label={t('profile.currentPassword')}
              placeholder={t('profile.currentPasswordPlaceholder')}
              {...mainForm.getInputProps('currentPassword')}
            />
            
            <PasswordInput
              label={t('profile.newPassword')}
              placeholder={t('profile.passwordPlaceholder')}
              {...mainForm.getInputProps('newPassword')}
            />
            
            <PasswordInput
              label={t('profile.confirmPassword')}
              placeholder={t('profile.confirmPasswordPlaceholder')}
              {...mainForm.getInputProps('confirmPassword')}
            />

            <Button 
              type="submit" 
              bg="orange.6" 
              mt="md" 
              fullWidth 
              loading={loading}
            >
              {t('common.save')}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}