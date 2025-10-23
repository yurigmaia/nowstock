import { AppShell, Burger, Group, NavLink, Menu, rem, Box, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  IconHome, IconBox, IconTruckDelivery, IconFileAnalytics, IconSettings,
  IconEdit, IconLogout,
  IconUserCircle
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import classes from './AppLayout.module.css';

import Logo from '../../assets/textlogoorange.svg?react';

export function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="xl"
      className={classes.appShell}
    >
      <AppShell.Header className={classes.header}>
        <Group h="100%" px="xl" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              className={classes.burger}
            />
            <Logo className={classes.logoSvg} />
          </Group>
          
          <Group gap="xs">
            <LanguageSwitcher />
            <ThemeSwitcher />
            
            <Menu 
              shadow="xl" 
              width={220} 
              radius="lg" 
              transitionProps={{ transition: 'pop' }}
            >
              <Menu.Target>
                <ActionIcon
                  variant="default"
                  size="lg"
                  radius="xl"
                  aria-label="Profile menu"
                >
                  <IconUserCircle stroke={1.5} />
                </ActionIcon  >
              </Menu.Target>
              <Menu.Dropdown className={classes.menuDropdown}>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item
                  leftSection={<IconEdit style={{ width: rem(16), height: rem(16) }} />}
                  className={classes.menuItem}
                >
                  {t('header.profile.edit')}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  onClick={logout}
                  leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
                  className={classes.menuItem}
                >
                  {t('header.profile.logout')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className={classes.navbar}>
        <Box className={classes.navSection}>
          <NavLink component={Link} to="/" label={t('nav.dashboard')} leftSection={<IconHome size="1.1rem" stroke={1.5} />} active={pathname === '/'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
          <NavLink component={Link} to="/products" label={t('nav.products')} leftSection={<IconBox size="1.1rem" stroke={1.5} />} active={pathname === '/products'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
          <NavLink label={t('nav.stock')} leftSection={<IconTruckDelivery size="1.1rem" stroke={1.5} />} active={pathname === '/stock'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} disabled />
          <NavLink label={t('nav.reports')} leftSection={<IconFileAnalytics size="1.1rem" stroke={1.5} />} active={pathname === '/reports'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} disabled />
          <NavLink label={t('nav.admin')} leftSection={<IconSettings size="1.1rem" stroke={1.5} />} active={pathname === '/admin'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} disabled />
        </Box>
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>
        <Box className={classes.content}>
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}