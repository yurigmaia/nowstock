import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Loader, Center } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { CustomThemeProvider } from './providers/CustomThemeProvider';

import "./i18n";

const loadingMarkup = (
  <Center style={{ height: "100vh" }}>
    <Loader color="orange" size="xl" />
  </Center>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CustomThemeProvider>
        <AuthProvider>
          <Suspense fallback={loadingMarkup}>
            <App />
          </Suspense>
        </AuthProvider>
      </CustomThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
