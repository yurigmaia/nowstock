// src/main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { MantineProvider, createTheme, Loader, Center } from '@mantine/core';
import '@mantine/core/styles.css';
import { BrowserRouter } from 'react-router-dom';

import './i18n';

const theme = createTheme({
  fontFamily: 'Verdana, sans-serif',
  primaryColor: 'orange',
});

// O componente de loading que será usado pelo Suspense.
const loadingMarkup = (
  <Center style={{ height: '100vh' }}>
    <Loader color="orange" size="xl" />
  </Center>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 1. MantineProvider agora é o container principal */}
      <MantineProvider theme={theme}>
        {/* 2. Suspense fica DENTRO do MantineProvider */}
        <Suspense fallback={loadingMarkup}>
          <App />
        </Suspense>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>,
);