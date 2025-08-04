import { createTheme, localStorageColorSchemeManager } from "@mantine/core";

export const theme = createTheme({
    fontFamily: "Inter, sans-serif",
    components: {
        Table: {
            styles: () => ({
                th: {
                    fontWeight: "600",
                    backgroundColor: "var(--app-primary-color)",
                    color:"white",
                },
            }),
        },
    },
});

export const colorSchemeManager = localStorageColorSchemeManager({
    key: "color-scheme",
});

export const cssVariablesResolver = (theme) => ({
    light: {
        "--mantine-color-header": theme.colors.blue[2],
        "--mantine-color-footer": theme.colors.blue[3],
        "--mantine-color-footer-links": theme.colors.blue[9],
        "--mantine-color-table-header": theme.colors.gray[2],


        "--app-primary-color": "#4361ee;",
        "--app-primary-text-color": "white",
        "--app-primary-active-color": "#1e293be6",
    },
    dark: {
        "--mantine-color-header": theme.colors.blue[9],
        "--mantine-color-footer": theme.colors.blue[8],
        "--mantine-color-footer-links": theme.colors.blue[2],
        "--mantine-color-table-header": theme.colors.gray[8],


        "--app-primary-color": "#334155",
        "--app-primary-active-color": "#1e293be6",
        "--app-primary-text-color": "#ffffff",
    },
});
