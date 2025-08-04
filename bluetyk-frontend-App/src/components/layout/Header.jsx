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
import logo from "../../assets/images/bluewhyte_logo.png";
import { useMediaQuery } from "@mantine/hooks";
import {
    IconPower,
    IconBell,
    IconUser,
    IconSettings,
    IconHome,
    IconUsers,
    IconChartBar,
    IconUserPlus,
    IconChevronDown,
    IconDots
} from "@tabler/icons-react";
import { useAuthStore } from "../../config/authStore";
import { useLogout } from "../../queries/auth";
import { useRef, useState, useEffect } from "react";
import { useDisclosure } from '@mantine/hooks';


export default function Header({ toggle, opened }) {
    const [openedDrawer, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;
    const logout = useLogout();
    const menuScrollRef = useRef();
    const authenticatedUser = useAuthStore.getState();
    const theme = useMantineTheme();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [underlineX, setUnderlineX] = useState(0);
    const [underlineWidth, setUnderlineWidth] = useState(0);

    const navLinks = [
        { label: "Dashboard", to: "/dashboard", icon: IconHome },
        { label: "Member", to: "/member/add-member", icon: IconUserPlus },
        { label: "Settings", to: "/settings", icon: IconSettings },
        { label: "Users", to: "/users", icon: IconUsers },
        { label: "Analytics", to: "/analytics", icon: IconChartBar },


    ];

    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            const activeEl = document.querySelector(".nav-link.active");
            if (activeEl) {
                const { offsetLeft, offsetWidth } = activeEl;
                setUnderlineX(offsetLeft);
                setUnderlineWidth(offsetWidth);
            }
        });

        return () => cancelAnimationFrame(raf);
    }, [currentPath, isMobile]);

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
                    <Image src={logo} radius="sm" h={55} w="auto" fit="contain" />
                </Box>

                {/* Navigation */}
                {!isMobile && (
                    <Box style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                        <Flex
                            gap={40}
                            justify="center"
                            ref={menuScrollRef}
                            style={{
                                minWidth: 0,
                                overflowX: "auto",
                                position: "relative",
                                paddingBottom: 4,
                            }}
                        >
                            {navLinks.map((link) => {
                                const isActive = currentPath === link.to;
                                const defaultColor = isActive ? theme.colors.blue[6] : "inherit";
                                const hoverColor = theme.colors.blue[7];
                                return (
                                    <Box
                                        key={link.to}
                                        component={Link}
                                        to={link.to}
                                        className={`nav-link ${isActive ? "active" : ""}`}
                                        style={{
                                            fontSize: "18px",
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            textDecoration: "none",
                                            color: defaultColor,
                                            padding: "4px 8px",
                                            position: "relative",
                                            transition: "color 0.3s ease"
                                        }}
                                        onMouseEnter={
                                            (e) => (e.currentTarget.style.color = hoverColor)}
                                        onMouseLeave={
                                            (e) => (e.currentTarget.style.color = defaultColor)}
                                    >
                                        <link.icon size={25} /> {link.label}
                                    </Box>
                                );
                            })}
                        </Flex>
                    </Box>
                )}

                {/* Profile & Icons */}
                <Flex gap="md" align="center" style={{ flexShrink: 0 }}>
                    <Text style={{fontSize: "18px",fontWeight: 600,}}>More</Text>
                    <Drawer
                        opened={openedDrawer}
                        onClose={closeDrawer}
                        position="top"
                        size="50%"
                        padding="md"
                        title="More Options"
                    >
                        <Stack>
                            <Text component={Link} to="/settings">⚙️ Settings</Text>
                            <Text component={Link} to="/help">❓ Help</Text>
                            <Text component={Link} to="/about">ℹ️ About</Text>
                        </Stack>
                    </Drawer>
                    <ActionIcon variant="light" color="blue" size="lg" radius="xl">
                        <IconBell size={20} className="text-blue-600" />
                    </ActionIcon>

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
                                Profile
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

                    <Burger
                        size="sm"
                        hiddenFrom="md"
                        opened={opened}
                        onClick={toggle}
                        color={theme.colors.gray[7]}
                    />
                </Flex>
            </Flex>

            {/* Moved underline bar to the very bottom of the header */}
            {!isMobile && (
                <Box
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: underlineX + 150, // +150 accounts for the logo width and padding
                        width: underlineWidth,
                        height: 3,
                        backgroundColor: theme.colors.blue[6],
                        borderRadius: 2,
                        transition: "left 0.3s ease, width 0.3s ease",
                    }}
                />
            )}
        </Box>
    );
}
