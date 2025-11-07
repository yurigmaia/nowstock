/**
 * @file main.tsx
 * @description
 * Ponto de entrada principal da aplicação React.
 * Renderiza a árvore de componentes, incluindo provedores globais
 * como Router, Auth, Theme e Notifications.
 */
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Loader, Center } from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { CustomThemeProvider } from './providers/CustomThemeProvider';

import './i18n';

const loadingMarkup = (
  <Center style={{ height: '100vh', background: 'var(--mantine-color-body)' }}>
    <Loader color="orange" size="xl" />
  </Center>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CustomThemeProvider>
          <Notifications />
          <Suspense fallback={loadingMarkup}>
            <App />
          </Suspense>
        </CustomThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);