import { ActionIcon, Tooltip } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from "react-i18next";

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { colorScheme, toggleColorScheme } = useTheme();

  return (
    <Tooltip label={t("theme.switcher.tooltip")}>
    <ActionIcon
      onClick={toggleColorScheme}
      variant="default"
      size="lg"
      radius="lg"
      aria-label="Toggle color scheme"
    >
      {colorScheme === "dark" ? (
        <IconSun size="1.2rem" />
      ) : (
        <IconMoon size="1.2rem" />
      )}
    </ActionIcon>
    </Tooltip>
  );
}
