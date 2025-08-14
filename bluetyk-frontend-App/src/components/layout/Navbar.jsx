import { AppShell, NavLink, Stack, Box, Text, useMantineTheme } from "@mantine/core";
import {
    IconHome2,
    IconUserPlus,
    IconDeviceDesktop,
    IconUsers,
    IconChartBar,
    IconApps,
    IconChevronRight,
    IconLogout
} from "@tabler/icons-react";
import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";

export default function Navbar() {
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;
    const theme = useMantineTheme();

    const [openMenu, setOpenMenu] = useState(null); // track which menu is open

    const navLinks = [
        {
            title: "Main",
            links: [
                { label: "Dashboard", to: "/dashboard", icon: IconHome2 },
                { label: "Member", to: "/members/member-layout", icon: IconUserPlus },
                { label: "Device", to: "/device/device-layout", icon: IconDeviceDesktop },
                { label: "Users", to: "/users/user-layout", icon: IconUsers },
                { label: "Attendance", to: "/attendance/view-attendence", icon: IconChartBar },
            ],
        },
        {
            title: "More Options",
            links: [
                {
                    label: "More 1",
                    icon: IconApps,
                    subLinks: [
                        { label: "Settings", to: "/more/settings" },
                        { label: "Reports", to: "/more/reports" },
                    ],
                },
                {
                    label: "More 2",
                    icon: IconApps,
                    subLinks: [
                        { label: "Logs", to: "/more/logs" },
                        { label: "Analytics", to: "/more/analytics" },
                    ],
                },
            ],
        },
    ];

    const handleToggle = (label) => {
        setOpenMenu(openMenu === label ? null : label); // toggle open/close
    };

    return (
        <Box
            mt={20}
            sx={{
                width: "75%",
                padding: "1rem",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
            }}
        >
            <Stack spacing="sm">
                {navLinks.map((section) => (
                    <><Box key={section.title} p={10}>
                        <Text weight={700} size="md" mb={4}>
                            {section.title}
                        </Text>
                        <Stack spacing="xs">
                            {section.links.map((link) => (
                                <Box key={link.label}>
                                    {/* Parent NavLink */}
                                    <NavLink
                                        href={link.to || "#"} // parent can optionally have a route
                                        label={link.label}
                                        leftSection={<link.icon size={20} stroke={1.5} />}
                                        rightSection={link.subLinks ? <IconChevronRight size={12} stroke={1.5} /> : null}
                                        active={currentPath === link.to}
                                        variant={currentPath === link.to ? "filled" : "subtle"}
                                        onClick={(e) => {
                                            if (link.subLinks) {
                                                e.preventDefault(); // prevent navigation if submenu exists
                                                handleToggle(link.label);
                                            }
                                        }} />

                                    {/* Collapsible Submenu */}
                                    {link.subLinks && openMenu === link.label && (
                                        <Stack pl={20} spacing="xs">
                                            {link.subLinks.map((sub) => (
                                                <NavLink
                                                    key={sub.label}
                                                    href={sub.to}
                                                    label={sub.label}
                                                    leftSection={<Box style={{ width: 16 }} />}
                                                    rightSection={<IconChevronRight size={12} stroke={1.5} />}
                                                    active={currentPath === sub.to}
                                                    variant={currentPath === sub.to ? "filled" : "subtle"}
                                                    sx={{ fontSize: 14 }} />
                                            ))}
                                        </Stack>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Box></>
                ))}
            </Stack>

            <AppShell.Section>
                <NavLink
                    label="Logout"
                    leftSection={<IconLogout size="1.2rem" />}
                    variant="subtle"
                    color="red"
                    styles={{
                        root: {
                            borderRadius: theme.radius.md,
                            '&:hover': {
                                backgroundColor: theme.colors.red[0],
                            }
                        }
                    }} />
            </AppShell.Section>

        </Box>
    );
}
