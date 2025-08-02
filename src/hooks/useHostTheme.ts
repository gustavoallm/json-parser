import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function useHostTheme() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const handleThemeChange = (event: MessageEvent) => {
      if (event.data.type === "THEME_CHANGE") {
        setTheme(event.data.theme);
      }
    };

    window.addEventListener("message", handleThemeChange);

    window.parent.postMessage({ type: "REQUEST_THEME" }, "*");

    return () => {
      window.removeEventListener("message", handleThemeChange);
    };
  }, []);

  return theme;
}
