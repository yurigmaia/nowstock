/**
 * @component AdminView
 * @description
 * Tela de administração do sistema.
 * Permite editar dados da empresa (Nome e CNPJ).
 */
import { Box, Title, Paper, TextInput, Button, Stack, Loader, Center } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function AdminView() {
  const { t } = useTranslation();
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const generalForm = useForm({
    initialValues: {
      nome: "",
      cnpj: "",
    },
    validate: {
      nome: (value) => (value.trim().length < 2 ? t('validation.nameShort') : null),
      cnpj: (value) => (value.length < 14 ? t('validation.cnpjInvalid') : null),
    }
  });

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const company = await apiService.getCompanyDetails();
        generalForm.setValues({
          nome: company.nome,
          cnpj: company.cnpj || '',
        });
      } catch (error) {
        console.error(error);
        notifications.show({ 
          title: t('common.error'), 
          message: t('admin.loadError'), 
          color: 'red', 
          icon: <IconX /> 
        });
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveCompany = async (values: typeof generalForm.values) => {
    setSaving(true);
    try {
      await apiService.updateCompanyDetails(values);
      notifications.show({ 
        title: t('common.success'), 
        message: t('admin.updateSuccess'), 
        color: 'green', 
        icon: <IconCheck /> 
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      notifications.show({ 
        title: t('common.error'), 
        message: error.message || t('admin.saveError'), 
        color: 'red', 
        icon: <IconX /> 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <Center h="50vh">
        <Loader color="orange" size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">
        {t('admin.title')}
      </Title>

      <Paper p="xl" withBorder shadow="md" radius="md" maw={600}>
        <form onSubmit={generalForm.onSubmit(handleSaveCompany)}>
          <Stack gap="md">
            <TextInput
              label={t('admin.form.storeName')}
              required
              {...generalForm.getInputProps("nome")}
            />
            <TextInput 
              label={t('admin.form.cnpj')}
              required
              maxLength={18}
              {...generalForm.getInputProps("cnpj")} 
            />
            <Button 
              bg="orange.6" 
              type="submit" 
              mt="md" 
              style={{ alignSelf: 'flex-end' }}
              loading={saving}
            >
              {t('common.save')}
            </Button>
          </Stack>
        </form>
      </Paper> 
    </Box>
  );
}