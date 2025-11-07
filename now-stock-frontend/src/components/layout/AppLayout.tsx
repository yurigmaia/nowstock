/**
 * @component AppLayout
 * @description
 * Layout principal da aplicação. Contém o cabeçalho com logo e menu de perfil,
 * e a barra lateral de navegação dividida em duas seções (principal e rodapé).
 * Controla a exibição de links baseados no nível de acesso do usuário (admin).
 */
import { AppShell, Burger, Group, NavLink, Menu, rem, Box, ActionIcon, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  IconHome, IconBox, IconTruckDelivery, IconFileAnalytics, IconSettings,
  IconEdit, IconLogout, IconUserCircle, IconFilePlus, IconCategory,
  IconUsers, IconArrowLeftRight, IconReport, IconTools, IconNfc
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
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
                  className={classes.profileButton}
                >
                  <IconUserCircle stroke={1.5} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown className={classes.menuDropdown}>
                <Menu.Label>Minha Conta</Menu.Label>
                <Menu.Item
                  component={Link}
                  to="/profile"
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
        <Stack justify="space-between" style={{ height: '100%' }}>
          
          {/* --- SEÇÃO SUPERIOR (NAVEGAÇÃO PRINCIPAL) --- */}
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
              defaultOpened={pathname.startsWith('/products') || pathname.startsWith('/suppliers') || pathname.startsWith('/categories') || pathname.startsWith('/users')}
            >
              <NavLink component={Link} to="/products" label="Produtos" leftSection={<IconBox size="1.0rem" stroke={1.5} />} active={pathname === '/products'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
              <NavLink component={Link} to="/categories" label="Categorias" leftSection={<IconCategory size="1.0rem" stroke={1.5} />} active={pathname === '/categories'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
              <NavLink component={Link} to="/suppliers" label="Fornecedores" leftSection={<IconTruckDelivery size="1.0rem" stroke={1.5} />} active={pathname === '/suppliers'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
              
              {/* Link de Usuários agora restrito a ADMIN */}
              {isAdmin && (
                <NavLink component={Link} to="/users" label="Usuários" leftSection={<IconUsers size="1.0rem" stroke={1.5} />} active={pathname === '/users'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
              )}
            </NavLink>
            
            <NavLink
              label="Estoque"
              leftSection={<IconBox size="1.1rem" stroke={1.5} />}
              className={classes.navLink}
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
              childrenOffset={28}
              defaultOpened={pathname.startsWith('/stock-current') || pathname.startsWith('/stock-adjust')}
            >
               <NavLink component={Link} to="/stock-current" label="Estoque Atual" leftSection={<IconFileAnalytics size="1.0rem" stroke={1.5} />} active={pathname === '/stock-current'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
               <NavLink component={Link} to="/stock-adjust" label="Ajuste Manual" leftSection={<IconTools size="1.0rem" stroke={1.5} />} active={pathname === '/stock-adjust'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
            </NavLink>
            
            <NavLink
              label="Movimentações"
              component={Link} to="/movements"
              leftSection={<IconArrowLeftRight size="1.1rem" stroke={1.5} />}
              className={classes.navLink}
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
              childrenOffset={28}
              defaultOpened={pathname.startsWith('/movements') || pathname.startsWith('/move-returns')}
            >
            </NavLink>
            <NavLink 
              component={Link} to="/rfid-config" 
              label="Configurar RFID" 
              leftSection={<IconNfc size="1.1rem" stroke={1.5} />} 
              active={pathname === '/rfid-config'} 
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
          </Box>

          {/* --- SEÇÃO INFERIOR (CONFIGURAÇÕES GERAIS E ADMIN) --- */}
          <Box className={classes.navSection}>
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
              component={Link} to="/settings" 
              label="Configurações" 
              leftSection={<IconTools size="1.1rem" stroke={1.5} />} 
              active={pathname === '/settings'} 
              className={classes.navLink} 
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} 
            />
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>
        <Box className={classes.content}>
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}