import React, { useState } from "react";
import { NavLink, Stack, Box, Text, Divider, ScrollArea, useMantineTheme } from "@mantine/core";
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
import { useLogout } from "../../queries/auth";
import { useRouterState } from "@tanstack/react-router";

export default function Sidebar() {
    const theme = useMantineTheme();
    const { location } = useRouterState();
    const currentPath = location.pathname;
    const [openMenu, setOpenMenu] = useState(null);
    const logout = useLogout();
    const handleLogout = () => logout.mutate();


    const navLinks = [
        {
            title: "Main",
            links: [
                { label: "Dashboard", to: "/dashboard", icon: IconHome2 },
                { label: "Member", to: "/members/member-layout", icon: IconUserPlus },
                { label: "Device", to: "/device/device-layout", icon: IconDeviceDesktop },
                { label: "Users", to: "/users/user-layout", icon: IconUsers },
                { label: "Attendance", to: "/attendance/attendance-layout   ", icon: IconChartBar },

            ],
        },
        {
            title: "More Options",
            links: [
                {
                    label: "More",
                    icon: IconApps,
                    subLinks: [
                        { label: "Location", to: "/location/location-layout" },
                        { label: "Department", to: "department/department-layout" },
                        { label: "Todays Reports", to: "/attendance/attendance-layout" },
                    ],
                },
            ],
        },
    ];

    const handleToggle = (label) => setOpenMenu(openMenu === label ? null : label);

    return (
        <Box style={{ width: 280, display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "white" }}>
            {/* Scrollable menu */}
            <ScrollArea style={{ flex: 1 }}>
                <Stack spacing="sm" p="md">
                    {navLinks.map((section) => (
                        <Box key={section.title}>
                            <Text weight={700} size="md" mb={4}>
                                {section.title}
                            </Text>
                            <Stack spacing="xs">
                                {section.links.map((link) => (
                                    <Box key={link.label}>
                                        <NavLink
                                            href={link.to || "#"}
                                            label={link.label}
                                            leftSection={link.icon ? <link.icon size={20} stroke={1.5} /> : null}
                                            rightSection={link.subLinks ? <IconChevronRight size={12} stroke={1.5} /> : null}
                                            active={currentPath === link.to}
                                            variant={currentPath === link.to ? "filled" : "subtle"}
                                            onClick={(e) => {
                                                if (link.subLinks) {
                                                    e.preventDefault();
                                                    handleToggle(link.label);
                                                } else {
                                                    setCurrentPath(link.to);
                                                }
                                            }}
                                        />
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
                                                        sx={{ fontSize: 14 }}
                                                    />
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </ScrollArea>

            {/* Logout fixed at bottom */}
            <Divider my="md" />
            <Box p="sm" mb={60}>
                <NavLink
                    label="Logout"
                    leftSection={<IconLogout size="1.2rem" />}
                    variant="subtle"
                    onClick={handleLogout}
                    styles={{
                        root: {
                            borderRadius: theme.radius.md,
                            "&:hover": { backgroundColor: theme.colors.red[0] },
                        },
                    }}
                />
            </Box>
        </Box>
    );
}
