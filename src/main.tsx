import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ThemeStoreProvider } from "@/theme/ThemeStore";
import { AppLayout } from "@/components/AppLayout";
import { ColorsPage } from "@/pages/ColorsPage";
import { StubPage } from "@/pages/StubPage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/farger" replace /> },
      { path: "farger", element: <ColorsPage /> },
      { path: "typografi", element: <StubPage title="Typografi" /> },
      { path: "radius", element: <StubPage title="Radius" /> },
      { path: "storrelser", element: <StubPage title="Størrelser" /> },
      { path: "oppsummering", element: <StubPage title="Oppsummering" /> },
      { path: "ta-i-bruk", element: <StubPage title="Ta i bruk" /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeStoreProvider>
      <RouterProvider router={router} />
    </ThemeStoreProvider>
  </StrictMode>,
);
