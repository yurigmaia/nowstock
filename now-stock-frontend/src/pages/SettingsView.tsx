/**
 * @component SettingsView
 * @description
 * Tela de Configurações onde o usuário pode alterar o tema (claro/escuro)
 * e o idioma da aplicação. Lê e altera o AuthContext.
 */
import { Box, Title, Paper, Select, SegmentedControl, Stack, Text, Center, Loader, Button, Group } from "@mantine/core";
import { IconSun, IconMoon, IconCheck } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { notifications } from "@mantine/notifications";

export function SettingsView() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, language, setLanguage } = useAuth();
  
  const [languages, setLanguages] = useState<{ value: string, label: string }[]>([]);
  const [loadingLangs, setLoadingLangs] = useState(true);
  const [localTheme, setLocalTheme] = useState(theme);
  const [localLanguage, setLocalLanguage] = useState(language);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiService.getAvailableLanguages()
      .then(setLanguages)
      .finally(() => setLoadingLangs(false));
  }, []);

  useEffect(() => {
    setLocalTheme(theme);
    setLocalLanguage(language);
  }, [theme, language]);

  const handleSave = async () => {
    setSaving(true);
    try {
      setTheme(localTheme);
      setLanguage(localLanguage);
      await i18n.changeLanguage(localLanguage);
      
      notifications.show({
        title: 'Sucesso',
        message: 'Configurações salvas com sucesso.',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Title order={2} c="orange.7" mb="lg">
        {t('settings.title')}
      </Title>

      <Paper p="md" withBorder shadow="md" radius="md" maw={600}>
        <Stack gap="xl">
          
          <Box>
            <Text fw={500} size="sm">{t('settings.themeTitle')}</Text>
            <Text size="xs" c="dimmed" mb="xs">
              {t('settings.themeSubtitle')}
            </Text>
            <SegmentedControl
              value={localTheme}
              onChange={(value) => setLocalTheme(value as 'light' | 'dark')}
              data={[
                { value: 'light', label: (
                    <Center><IconSun size={16} /><Box ml="xs">{t('settings.themeLight')}</Box></Center>
                  ) },
                { value: 'dark', label: (
                    <Center><IconMoon size={16} /><Box ml="xs">{t('settings.themeDark')}</Box></Center>
                  ) },
              ]}
              color="orange"
              fullWidth
            />
          </Box>
          
          <Box>
            <Text fw={500} size="sm">{t('settings.langTitle')}</Text>
            <Text size="xs" c="dimmed" mb="xs">
              {t('settings.langSubtitle')}
            </Text>
            {loadingLangs ? (
              <Loader color="orange" size="sm" />
            ) : (
              <Select
                placeholder="Carregando..."
                data={languages}
                value={localLanguage.split('-')[0]}
                onChange={(value) => value && setLocalLanguage(value)}
                allowDeselect={false}
              />
            )}
          </Box>

          <Group justify="flex-end">
            <Button 
              onClick={handleSave} 
              loading={saving} 
              bg="orange.6"
            >
              Salvar Configurações
            </Button>
          </Group>

        </Stack>
      </Paper>
    </Box>
  );
}