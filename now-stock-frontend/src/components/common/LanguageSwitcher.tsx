import { useTranslation } from "react-i18next";
import { ActionIcon, Menu, Tooltip } from "@mantine/core";
import { IconWorld, IconCheck } from "@tabler/icons-react";

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (lang: "pt" | "en") => {
    i18n.changeLanguage(lang);
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Tooltip label={t("language.switcher.tooltip")}>
          <ActionIcon
            variant="default"
            size="lg"
            radius="xl"
            aria-label="Change language"
          >
            <IconWorld />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t("language.switcher.label")}</Menu.Label>
        <Menu.Item
          onClick={() => changeLanguage("pt")}
          rightSection={
            currentLanguage.startsWith("pt") ? <IconCheck size={14} /> : null
          }
        >
          Português
        </Menu.Item>
        <Menu.Item
          onClick={() => changeLanguage("en")}
          rightSection={
            currentLanguage.startsWith("en") ? <IconCheck size={14} /> : null
          }
        >
          English
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
