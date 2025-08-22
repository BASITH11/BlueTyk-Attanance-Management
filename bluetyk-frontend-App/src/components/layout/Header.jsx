import { Link, useRouterState } from "@tanstack/react-router";
import {
    ActionIcon,
    Box,
    Burger,
    Flex,
    Image,
    Menu,
    Text,
    useMantineTheme,
    Drawer,
    Stack,
} from "@mantine/core";
import logo from "../../assets/images/logo.png";
import { useMediaQuery } from "@mantine/hooks";
import {
    IconPower,
    IconFolders,
    IconUser,
    IconSettings,
    IconHome,
    IconUsers,
    IconChartBar,
    IconUserPlus,
    IconChevronDown,
    IconApps,
    IconDeviceDesktop,
    IconX,
    IconLocation
} from "@tabler/icons-react";
import { useAuthStore } from "../../config/authStore";
import { useLogout } from "../../queries/auth";
import { useRef, useState, useEffect } from "react";
import { capitalize } from "../../utils/helpers";

export default function Header({ toggle, opened }) {
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;
    const logout = useLogout();
    const menuScrollRef = useRef();
    const authenticatedUser = useAuthStore.getState();
    const theme = useMantineTheme();

    const isMobile = useMediaQuery("(max-width: 768px)");
    const isTablet = useMediaQuery("(max-width: 1024px)");



    const navLinks = [
        { label: "Dashboard", to: "/dashboard", icon: IconHome },
        { label: `${capitalize(authenticatedUser.entity)}`, to: "/members/member-layout", icon: IconUserPlus },
        { label: "Device", to: "/device/device-layout", icon: IconDeviceDesktop },
        { label: "Users", to: "/users/user-layout", icon: IconUsers },
        { label: "Attendance", to: "/attendance/view-attendence", icon: IconChartBar },
        {
            label: "More",
            icon: IconApps,
            isMore: true,
            children: [
                { label: "Locations", to: "/location/location-layout", icon: IconLocation },
                { label: "Department", to: "/department/department-layout", icon: IconFolders },
                { divider: true },
                { label: "Todays Report", to: "/attendance/attendance-layout", icon: IconUser, color: "green" },
            ],
        },

    ];



    const handleLogout = () => logout.mutate();

    return (
        <Box
            className="sticky top-0 z-50 shadow-md"
            bg="white"
            style={{ position: "relative" }}
        >
            <Flex
                h={70}
                px="lg"
                align="center"
                className="w-full border-b border-gray-200"
                justify="space-between"
                style={{ position: "relative" }}
            >
                {/* Logo */}
                <Box style={{ flexShrink: 0 }}>
                    <Image src={logo} radius="sm" h={155} w="auto" fit="contain" />
                </Box>

                {/* Navigation */}
                {!isMobile && (
                    <Box
                        style={{
                            position: "relative",
                            flex: 1,
                            overflow: "hidden",
                            maxWidth: "100%",
                        }}
                    >
                        <Flex
                            gap={28}
                            justify="center"
                            ref={menuScrollRef}
                            wrap="nowrap"
                            style={{
                                minWidth: 0,
                                overflowX: isTablet ? "auto" : "visible",
                                paddingBottom: 4,
                                scrollbarWidth: "none", // Firefox
                                msOverflowStyle: "none", // IE
                            }}
                            className="no-scrollbar"
                        >
                            {navLinks.map((link) => {
                                const isActive = currentPath === link.to;
                                const defaultColor = isActive ? theme.colors.blue[6] : "inherit";
                                const hoverColor = theme.colors.blue[7];

                                const commonStyles = {
                                    fontSize: "clamp(14px, 1.2vw, 18px)",
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    textDecoration: "none",
                                    color: defaultColor,
                                    padding: "4px 8px",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "color 0.3s ease",
                                    whiteSpace: "nowrap",
                                };

                                if (link.isMore) {
                                    return (
                                        <Menu
                                            shadow="sm"
                                            width={200}
                                            position="bottom-center"
                                            withArrow
                                            key="more"
                                        >
                                            <Menu.Target>
                                                <Box
                                                    style={commonStyles}
                                                    onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                                                    onMouseLeave={(e) => (e.currentTarget.style.color = defaultColor)}
                                                >
                                                    <link.icon size={22} />
                                                    {!isTablet && link.label}
                                                </Box>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Label>{link.label}</Menu.Label>
                                                {link.children?.map((child, idx) =>
                                                    child.divider ? (
                                                        <Menu.Divider key={idx} />
                                                    ) : (
                                                        <Menu.Item
                                                            key={child.to || idx}
                                                            leftSection={<child.icon size={18} />}
                                                            component={Link}
                                                            to={child.to}
                                                            color={child.color || "inherit"}
                                                        >
                                                            {child.label}
                                                        </Menu.Item>
                                                    )
                                                )}
                                            </Menu.Dropdown>
                                        </Menu>
                                    );
                                }

                                return (
                                    <Box
                                        key={link.to}
                                        component={Link}
                                        to={link.to}
                                        className={`nav-link ${isActive ? "active" : ""}`}
                                        style={commonStyles}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.color = hoverColor)
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.color = defaultColor)
                                        }
                                    >
                                        <link.icon size={22} />
                                        {!isTablet && link.label}
                                    </Box>
                                );
                            })}
                        </Flex>
                    </Box>
                )}


                {/* Profile & Icons */}
                <Flex gap="xl" align="center" style={{ flexShrink: 0 }}>
                    {!isMobile && (
                        <Menu shadow="sm" width={200} position="bottom-end" withArrow>
                            <Menu.Target>
                                <Flex align="center" gap="sm" className="cursor-pointer p-1">
                                    <Box
                                        style={{
                                            width: 35,
                                            height: 35,
                                            borderRadius: "50%",
                                            backgroundColor: "var(--app-primary-color)",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 600,
                                            fontSize: 20,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {authenticatedUser.user?.name?.charAt(0) || "B"}
                                    </Box>
                                    <Box visibleFrom="sm">
                                        <Text size="md" fw={800} mb={-4}>
                                            {authenticatedUser.user?.name || "Basith"}
                                        </Text>
                                        <Text
                                            size="sm"
                                            c="dimmed"
                                            style={{
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                                overflow: "hidden",
                                                maxWidth: "160px",
                                            }}
                                        >
                                            {authenticatedUser.user?.email || "admin@gmail.com"}
                                        </Text>
                                    </Box>
                                    <IconChevronDown size={20} stroke={2.5} />
                                </Flex>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>Account</Menu.Label>
                                <Menu.Item
                                    leftSection={<IconUser size={18} />}
                                    component={Link}
                                    to="/profile"
                                >
                                    Location
                                </Menu.Item>
                                <Menu.Item leftSection={<IconSettings size={18} />}>
                                    Settings
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconPower size={18} />}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    )}
                    {opened ? (
                        <ActionIcon
                            size="lg"
                            hiddenFrom="md"
                            variant="subtle"
                            onClick={toggle}
                        >
                            <IconX size={24} stroke={2.5} color={theme.colors.gray[7]} />
                        </ActionIcon>
                    ) : (
                        <Burger
                            size="sm"
                            hiddenFrom="md"
                            opened={opened}
                            onClick={toggle}
                            color={theme.colors.gray[7]}
                        />
                    )}
                </Flex>
            </Flex>

        </Box>
    );
}
