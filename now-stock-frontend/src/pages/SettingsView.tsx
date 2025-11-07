/**
 * @component SettingsView
 * @description
 * Tela de Configurações onde o usuário pode alterar o tema (claro/escuro)
 * e o idioma da aplicação. Lê e altera o AuthContext.
 */
import { Box, Title, Paper, Select, SegmentedControl, Stack, Text, Center, Loader } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from "react";
import { apiService } from "../services/api";

export function SettingsView() {
  const { t, i18n } = useTranslation();
  // Pega as preferências e as funções de alteração do AuthContext
  const { theme, setTheme, language, setLanguage } = useAuth();
  
  const [languages, setLanguages] = useState<{ value: string, label: string }[]>([]);
  const [loadingLangs, setLoadingLangs] = useState(true);

  useEffect(() => {
    apiService.getAvailableLanguages()
      .then(setLanguages)
      .finally(() => setLoadingLangs(false));
  }, []);

  // Handler para o SegmentedControl de Tema
  const handleThemeChange = (value: string) => {
    if (value === 'light' || value === 'dark') {
      setTheme(value); // Chama a função do AuthContext
    }
  };

  // Handler para o Select de Idioma
  const handleLanguageChange = (langCode: string | null) => {
    if (langCode) {
      setLanguage(langCode); // Chama a função do AuthContext
      i18n.changeLanguage(langCode); // Informa o i18next
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
              value={theme} // Lê o valor do AuthContext
              onChange={handleThemeChange} // Chama a função do AuthContext
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
                value={language.split('-')[0]} // Lê o valor do AuthContext
                onChange={handleLanguageChange}
                allowDeselect={false}
              />
            )}
          </Box>

        </Stack>
      </Paper>
    </Box>
  );
}