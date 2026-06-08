import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AppThemeProvider } from "@/shared/theme/AppThemeProvider";
import { ThemeStoreProvider } from "@/themebuilder/theme/ThemeStore";
import { BuilderLayout } from "@/themebuilder/BuilderLayout";
import { FrontThemeProvider } from "@/site/theme/FrontThemeProvider";
import { SiteLayout } from "@/site/SiteLayout";
import { FrontPage } from "@/site/pages/FrontPage";
import { SitePlaceholder } from "@/site/pages/SitePlaceholder";
import { ColorsPage } from "@/themebuilder/pages/ColorsPage";
import { TypographyPage } from "@/themebuilder/pages/TypographyPage";
import { BorderRadiusPage } from "@/themebuilder/pages/BorderRadiusPage";
import { SizesPage } from "@/themebuilder/pages/SizesPage";
import { ApplyPage } from "@/themebuilder/pages/ApplyPage";
import "./index.css";

const router = createBrowserRouter([
  {
    // designsystemet.no — the main site. No theme-builder state here.
    path: "/",
    element: (
      <FrontThemeProvider>
        <SiteLayout />
      </FrontThemeProvider>
    ),
    children: [
      { index: true, element: <FrontPage /> },
      { path: "intro", element: <SitePlaceholder title="Intro" /> },
      { path: "kom-i-gang", element: <SitePlaceholder title="Kom i gang" /> },
      { path: "komponenter", element: <SitePlaceholder title="Komponenter" /> },
      { path: "monstre", element: <SitePlaceholder title="Mønstre" /> },
      { path: "god-praksis", element: <SitePlaceholder title="God praksis" /> },
      { path: "blogg", element: <SitePlaceholder title="Blogg" /> },
    ],
  },
  {
    // Temabyggeren — mirrors theme.designsystemet.no. Builder store scoped here.
    path: "/temabygger",
    element: (
      <ThemeStoreProvider>
        <BuilderLayout />
      </ThemeStoreProvider>
    ),
    children: [
      { index: true, element: <Navigate to="/temabygger/farger" replace /> },
      { path: "farger", element: <ColorsPage /> },
      { path: "typografi", element: <TypographyPage /> },
      { path: "radius", element: <BorderRadiusPage /> },
      { path: "storrelser", element: <SizesPage /> },
      { path: "ta-i-bruk", element: <ApplyPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>
  </StrictMode>,
);
