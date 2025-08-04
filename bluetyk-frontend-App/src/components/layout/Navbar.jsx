import { Link, useRouterState } from "@tanstack/react-router";
import {
    Stack,
    Text,
    Accordion,
    Box,
    ActionIcon,
    Avatar,
    Flex
} from "@mantine/core";
import { IconPower, IconBell, IconPlus } from "@tabler/icons-react";


export default function Navbar({ toggle }) {

    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;
    const menuItems = [
        {
            label: "Dashboard",
            url: "/dashboard",
            type: "link"
        },
        {
            label: "Members Management",
            type: "dropdown",
            items: [
                { label: "Add Members", url: "/members/add-members" },
                { label: "View Members", url: "/members/view-members"},
                
            ]
        },
       
    ];

    return (
        <Stack className="relative flex justify-between h-full">
            <Stack gap={1} className="p-2 overflow-auto">
                <Box className=" p-2 border-b-3 border-[var(--app-primary-color)]">
                    <Text size="md">MENU</Text>
                </Box>
                {
                    menuItems.map((menu, index) => {
                        if (menu.type === "link") {
                            return (
                                <Link key={index} to={menu.url} className={`flex items-center gap-1 py-2 h-full text-sm px-2 cursor-pointer hover:bg-[var(--app-primary-active-color)] hover:text-[var(--app-primary-text-color)] ${currentPath === menu.url ? "bg-[var(--app-primary-active-color)] text-[var(--app-primary-text-color)]" : ""}`} 
                                onClick={toggle}>
                                    <Text size="sm" className="font-semibold">
                                        {menu.label.toUpperCase()}
                                    </Text>
                                </Link>
                            )
                        } else {
                            return (
                                <Accordion
                                    key={index}
                                    multiple={true}
                                    defaultValue={["creation"]}
                                    chevron={<IconPlus/>}
                                    styles={{
                                        item: {
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                        },
                                        control: {
                                            padding: "0px 0 0 8px",
                                            fontWeight: 600,
                                            backgroundColor: 'transparent',
                                            '&:hover': {
                                                backgroundColor: "var(--app-primary-active-color)",
                                            }
                                        },

                                    }}
                                    transitionDuration={500}
                                >
                                    <Accordion.Item value="creation">
                                        <Accordion.Control>
                                            <Text size="sm" className="font-semibold">
                                                {menu.label.toUpperCase()}
                                            </Text>
                                        </Accordion.Control>
                                        <Accordion.Panel>
                                            <Stack gap={1}>
                                                {menu.items.map((subMenu, subIndex) => (
                                                    <Link
                                                        key={subIndex}
                                                        to={subMenu.url}
                                                        className={`block py-1 px-2 text-sm hover:bg-[var(--app-primary-active-color)] hover:text-[var(--app-primary-text-color)] ${currentPath === subMenu.url ? "bg-[var(--app-primary-active-color)] text-[var(--app-primary-text-color)]" : ""}`}
                                                        onClick={toggle}
                                                    >
                                                        {subMenu.label.toUpperCase()}
                                                    </Link>
                                                ))}
                                            </Stack>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                </Accordion>
                            )
                        }

                    })
                }

            </Stack>

            <Box className="md:hidden w-full flex justify-around items-center border-t-3 border-[var(--app-primary-color)] pt-2">
                <Box className="flex">
                    <Avatar radius="sm"> T </Avatar>
                    <Box px="sm">
                        <Text size="sm">demo@gmail.com</Text>
                        <Text size="xs" c="dimmed">admin</Text>
                    </Box>
                </Box>
                <Box className="flex gap-2">
                    <ActionIcon className="hidden md:flex" variant="filled" color="rgba(227, 48, 60, 1)" size="md">
                        <IconPower size={18} />
                    </ActionIcon>
                    <ActionIcon className="hidden md:flex" variant="filled" color="rgb(23, 23, 112, 1)" size="md">
                        <IconBell size={18} />
                    </ActionIcon>
                </Box>
            </Box>

        </Stack>
    )
}