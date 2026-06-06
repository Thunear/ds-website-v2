import { Outlet } from "react-router-dom";
import { useThemeStore } from "@/theme/ThemeStore";
import { SiteHeader } from "./SiteHeader";
import { ThemeBar } from "./ThemeBar";
import { TabNav } from "./TabNav";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  const { appTheme, mode } = useThemeStore();
  return (
    // appTheme themes the chrome; the canvas (tabBody) re-pins tokens to `mode`.
    <div className={styles.app} data-app-theme={appTheme}>
      <SiteHeader />
      <ThemeBar />
      <main className={styles.content}>
        {/* The whole builder box follows the mode being designed; the chrome
            around it follows appTheme. */}
        <div className={styles.card} data-mode={mode}>
          <TabNav />
          <div className={styles.tabBody}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
