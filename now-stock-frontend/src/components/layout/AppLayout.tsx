/**
 * @component AppLayout
 * @description
 * Layout principal da aplicação. Contém o cabeçalho e a barra lateral.
 * * CORREÇÃO: Filtra links baseados no nível de acesso.
 * - Visualizador NÃO VÊ: Movimentações, Ajuste Manual, RFID, Admin, Usuários.
 */
import { AppShell, Burger, Group, NavLink, Menu, rem, Box, ActionIcon, Avatar, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IconHome, IconBox, IconTruckDelivery, IconFileAnalytics, IconSettings,
  IconEdit, IconLogout, IconUserCircle, IconFilePlus, IconCategory,
  IconUsers, IconArrowLeftRight, IconReport, IconTools, IconNfc
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import classes from './AppLayout.module.css';
import Logo from '../../assets/textlogoorangenew.svg?react';
import { useTranslation } from 'react-i18next';

export function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isAdmin = user?.nivel_acesso === 'admin';
  const canOperate = user?.nivel_acesso === 'admin' || user?.nivel_acesso === 'operador';

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
                  {user?.nome ? (
                    <Avatar color="orange" radius="xl" size="sm">
                      {user.nome.charAt(0).toUpperCase()}
                    </Avatar>
                  ) : (
                    <IconUserCircle stroke={1.5} />
                  )}
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown className={classes.menuDropdown}>
                <Menu.Label>{t('header.profile.myAccount')}</Menu.Label>
                <Menu.Item>
                    <Box style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text size="sm" fw={500}>{user?.nome}</Text>
                        <Text size="xs" c="dimmed">{user?.email}</Text>
                    </Box>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  component={Link}
                  to="/profile"
                  leftSection={<IconEdit style={{ width: rem(16), height: rem(16) }} />}
                  className={classes.menuItem}
                >
                  {t('header.profile.edit')}
                </Menu.Item>
                <Menu.Item
                  color="red"
                  onClick={() => { logout(); navigate('/login'); }}
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

      <AppShell.Navbar p={0} className={classes.navbar}>
        <div className={classes.navbarStack}>
          <Box className={classes.navSectionMain}>
            <NavLink 
              component={Link} to="/" 
              label={t('nav.dashboard')}
              leftSection={<IconHome size="1.1rem" stroke={1.5} />} 
              active={pathname === '/'} 
              className={classes.navLink} 
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} 
            />
            
            <NavLink
              label={t('nav.cadastros')}
              leftSection={<IconFilePlus size="1.1rem" stroke={1.5} />}
              className={classes.navLink}
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
              childrenOffset={28}
              defaultOpened={pathname.startsWith('/products') || pathname.startsWith('/suppliers') || pathname.startsWith('/categories') || pathname.startsWith('/users')}
            >
              <NavLink component={Link} to="/products" label={t('nav.produtos')} leftSection={<IconBox size="1.0rem" stroke={1.5} />} active={pathname === '/products'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
              <NavLink component={Link} to="/categories" label={t('nav.categorias')} leftSection={<IconCategory size="1.0rem" stroke={1.5} />} active={pathname === '/categories'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
              <NavLink component={Link} to="/suppliers" label={t('nav.fornecedores')} leftSection={<IconTruckDelivery size="1.0rem" stroke={1.5} />} active={pathname === '/suppliers'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
              
              {isAdmin && (
                <NavLink component={Link} to="/users" label={t('nav.usuarios')} leftSection={<IconUsers size="1.0rem" stroke={1.5} />} active={pathname === '/users'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
              )}
            </NavLink>
            
            <NavLink
              label={t('nav.estoque')}
              leftSection={<IconBox size="1.1rem" stroke={1.5} />}
              className={classes.navLink}
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
              childrenOffset={28}
              defaultOpened={pathname.startsWith('/stock-current') || pathname.startsWith('/stock-adjust')}
            >
                <NavLink component={Link} to="/stock-current" label={t('nav.estoqueAtual')} leftSection={<IconFileAnalytics size="1.0rem" stroke={1.5} />} active={pathname === '/stock-current'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
                
                {canOperate && (
                    <NavLink component={Link} to="/stock-adjust" label={t('nav.ajusteManual')} leftSection={<IconTools size="1.0rem" stroke={1.5} />} active={pathname === '/stock-adjust'} className={classes.navLink} classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} />
                )}
            </NavLink>
            
            {canOperate && (
                <NavLink
                label={t('nav.movimentacoes')}
                component={Link} to="/movements"
                leftSection={<IconArrowLeftRight size="1.1rem" stroke={1.5} />}
                active={pathname === '/movements'}
                className={classes.navLink}
                classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }}
                />
            )}

            <NavLink 
              component={Link} to="/reports" 
              label={t('nav.relatorios')}
              leftSection={<IconReport size="1.1rem" stroke={1.5} />} 
              active={pathname === '/reports'} 
              className={classes.navLink} 
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} 
            />

            {canOperate && (
                <NavLink 
                component={Link} to="/rfid-config" 
                label={t('nav.configurarRfid')}
                leftSection={<IconNfc size="1.1rem" stroke={1.5} />} 
                active={pathname === '/rfid-config'} 
                className={classes.navLink} 
                classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} 
                />
            )}
          </Box>

          <Box className={classes.navSectionFooter}>
            {isAdmin && (
              <NavLink 
                component={Link} to="/admin" 
                label={t('nav.admin')}
                leftSection={<IconSettings size="1.1rem" stroke={1.5} />} 
                active={pathname === '/admin'} 
                className={classes.navLink} 
                classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} 
              />
            )}
            <NavLink 
              component={Link} to="/settings" 
              label={t('nav.configuracoes')}
              leftSection={<IconTools size="1.1rem" stroke={1.5} />} 
              active={pathname === '/settings'} 
              className={classes.navLink} 
              classNames={{ root: classes.navLinkRoot, label: classes.navLinkLabel }} 
            />
          </Box>
        </div>
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>
        <Box className={classes.content}>
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}