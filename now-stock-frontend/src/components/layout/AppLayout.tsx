/**
 * AppLayout
 * Componente principal do layout da aplicação (Cabeçalho e Menu Lateral).
 * Inclui o cabeçalho, barra de navegação e a área de conteúdo principal (Outlet).
 * Controla a exibição de links baseados no nível de acesso do usuário.
 */
import { AppShell, Burger, Group, NavLink, Menu, rem, Box, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  IconHome, IconBox, IconTruckDelivery, IconFileAnalytics, IconSettings,
  IconEdit, IconLogout, IconUserCircle, IconFilePlus, IconCategory,
  IconUsers, IconArrowLeftRight, IconReport, IconTools,
  IconPackageExport, IconNfc
} from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import classes from './AppLayout.module.css';
import Logo from '../../assets/textlogoorange.svg?react';

export function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { logout, user } = useAuth();
  const { pathname } = useLocation();

  const isAdmin = user?.nivel === 'admin';

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
                  aria-label="Menu do Perfil"
                >
                  <IconUserCircle stroke={1.5} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown className={classes.menuDropdown}>
                <Menu.Label>Minha Conta</Menu.Label>
                <Menu.Item
                  component={Link} // 1. Transforma em Link
                  to="/profile"    // 2. Aponta para a nova rota
                  leftSection={<IconEdit style={{ width: rem(16), height: rem(16) }} />}
                  className={classes.menuItem}
                >
                  Editar Perfil
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  onClick={logout}
                  leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
                  className={classes.menuItem}
                >
                  Sair
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className={classes.navbar}>
        <Box className={classes.navSection}>
          
          <NavLink 
            component={Link} to="/" 
            label="Dashboard" 
            leftSection={<IconHome size="1.1rem" stroke={1.5} />} 
            active={pathname === '/'} 
            className={classes.navLink} 
            classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} 
          />
          
          <NavLink
            label="Cadastros"
            leftSection={<IconFilePlus size="1.1rem" stroke={1.5} />}
            className={classes.navLink}
            classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
            childrenOffset={28}
            // REMOVIDA a prop 'opened'. O NavLink agora controla o abre/fecha.
          >
            <NavLink
              component={Link} to="/products"
              label="Produtos"
              leftSection={<IconBox size="1.0rem" stroke={1.5} />}
              active={pathname === '/products'}
              className={classes.navLink} 
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
            />
            <NavLink
              component={Link} to="/categories"
              label="Categorias"
              leftSection={<IconCategory size="1.0rem" stroke={1.5} />}
              active={pathname === '/categories'}
              className={classes.navLink} 
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
            />
            <NavLink
              component={Link} to="/suppliers"
              label="Fornecedores"
              leftSection={<IconTruckDelivery size="1.0rem" stroke={1.5} />}
              active={pathname === '/suppliers'}
              className={classes.navLink} 
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
            />
            <NavLink
              component={Link} to="/users"
              label="Usuários"
              leftSection={<IconUsers size="1.0rem" stroke={1.5} />}
              active={pathname === '/users'}
              className={classes.navLink} 
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
            />
          </NavLink>
          
          <NavLink
            label="Estoque"
            leftSection={<IconBox size="1.1rem" stroke={1.5} />}
            className={classes.navLink}
            classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
            childrenOffset={28}
            // REMOVIDA a prop 'opened'.
          >
             <NavLink
              component={Link} to="/stock-current"
              label="Estoque Atual"
              leftSection={<IconFileAnalytics size="1.0rem" stroke={1.5} />}
              active={pathname === '/stock-current'}
              className={classes.navLink} 
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
            />
             <NavLink
              component={Link} to="/stock-adjust"
              label="Ajuste Manual"
              leftSection={<IconTools size="1.0rem" stroke={1.5} />}
              active={pathname === '/stock-adjust'}
              className={classes.navLink} 
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
            />
          </NavLink>
          
         {/* CORRIGIDO: Agora é um link direto */}
          <NavLink
            component={Link}
            to="/movements"
            label="Movimentações"
            leftSection={<IconArrowLeftRight size="1.1rem" stroke={1.5} />}
            active={pathname === '/movements'}
            className={classes.navLink}
            classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
          />
          <NavLink 
            component={Link} to="/reports" 
            label="Relatórios" 
            leftSection={<IconReport size="1.1rem" stroke={1.5} />} 
            active={pathname === '/reports'} 
            className={classes.navLink} 
            classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} 
          />
          
          {isAdmin && (
            <NavLink 
              component={Link} to="/admin" 
              label="Administração" 
              leftSection={<IconSettings size="1.1rem" stroke={1.5} />} 
              active={pathname === '/admin'} 
              className={classes.navLink} 
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} 
            />
          )}

          <NavLink 
            component={Link} to="/rfid-config" 
            label="Configurar RFID" 
            leftSection={<IconNfc size="1.1rem" stroke={1.5} />} 
            active={pathname === '/rfid-config'} 
            className={classes.navLink} 
            classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} 
          />

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