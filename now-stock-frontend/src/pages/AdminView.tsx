/**
 * @component AdminView
 * @description
 * Tela de administração do sistema.
 * Permite editar dados da empresa e visualizar logs.
 * Conecta-se à API real e usa internacionalização (i18n).
 */
import { Box, Title, Tabs, Paper, TextInput, Select, Button, Stack, Group, Table, Loader, Center, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface LogEntry {
  id_log: number;
  id_usuario: number;
  usuario_nome?: string;
  acao: string;
  data_log: string;
}

export function AdminView() {
  const { t } = useTranslation();
  const [logs] = useState<LogEntry[]>([]);
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

  const systemForm = useForm({
    initialValues: {
      backupInterval: "diario",
      alertEmail: "",
    },
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

  const logRows = logs.map((log) => (
    <Table.Tr key={log.id_log}>
      <Table.Td>{log.usuario_nome || log.id_usuario}</Table.Td>
      <Table.Td>{log.acao}</Table.Td>
      <Table.Td>{new Date(log.data_log).toLocaleString('pt-BR')}</Table.Td>
    </Table.Tr>
  ));

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

      <Paper p="md" withBorder shadow="md" radius="md">
        <Tabs defaultValue="general">
          <Tabs.List>
            <Tabs.Tab value="general">{t('admin.tabs.general')}</Tabs.Tab>
            <Tabs.Tab value="system">{t('admin.tabs.system')}</Tabs.Tab>
            <Tabs.Tab value="logs">{t('admin.tabs.logs')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general" pt="lg">
            <form onSubmit={generalForm.onSubmit(handleSaveCompany)}>
              <Stack gap="md" maw={500}>
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
                  style={{ alignSelf: 'flex-start' }}
                  loading={saving}
                >
                  {t('common.save')}
                </Button>
              </Stack>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="system" pt="lg">
            <form onSubmit={systemForm.onSubmit((values) => console.log(values))}>
              <Stack gap="md" maw={500}>
                <Select
                  label={t('admin.form.backupInterval')}
                  data={[
                    { value: "diario", label: t('admin.backup.daily') },
                    { value: "semanal", label: t('admin.backup.weekly') },
                    { value: "mensal", label: t('admin.backup.monthly') },
                  ]}
                  {...systemForm.getInputProps("backupInterval")}
                />
                <TextInput
                  label={t('admin.form.alertEmail')}
                  {...systemForm.getInputProps("alertEmail")}
                />
                <Group gap="md" mt="md">
                  <Button bg="orange.6" type="submit">
                    {t('admin.form.saveParams')}
                  </Button>
                  <Button variant="default">{t('admin.form.runBackup')}</Button>
                </Group>
              </Stack>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="logs" pt="lg">
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('admin.logs.user')}</Table.Th>
                  <Table.Th>{t('admin.logs.action')}</Table.Th>
                  <Table.Th>{t('admin.logs.date')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {logs.length > 0 ? logRows : (
                  <Table.Tr><Table.Td colSpan={3}><Text ta="center" c="dimmed">{t('admin.logs.empty')}</Text></Table.Td></Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Tabs.Panel> 
        </Tabs>
      </Paper> 
    </Box>
  );
}