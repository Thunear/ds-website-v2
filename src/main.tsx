import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ThemeStoreProvider } from "@/theme/ThemeStore";
import { AppLayout } from "@/components/AppLayout";
import { ColorsPage } from "@/pages/ColorsPage";
import { TypographyPage } from "@/pages/TypographyPage";
import { BorderRadiusPage } from "@/pages/BorderRadiusPage";
import { SizesPage } from "@/pages/SizesPage";
import { ApplyPage } from "@/pages/ApplyPage";
import { StubPage } from "@/pages/StubPage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/farger" replace /> },
      { path: "farger", element: <ColorsPage /> },
      { path: "typografi", element: <TypographyPage /> },
      { path: "radius", element: <BorderRadiusPage /> },
      { path: "storrelser", element: <SizesPage /> },
      { path: "oppsummering", element: <StubPage title="Oppsummering" /> },
      { path: "ta-i-bruk", element: <ApplyPage /> },
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
