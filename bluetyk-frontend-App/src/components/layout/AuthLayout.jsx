import { 
    AppShell,
    Box,
    Flex,
    Image,
} from "@mantine/core";
import { IconInfoSquare } from "@tabler/icons-react";
import { Outlet } from "@tanstack/react-router";
import logo from "../../assets/images/bluewhyte_logo.png"


export default function AuthLayout() {
    return (
        <AppShell
            header={{ height: { base: 80 } }}
            aside={false}
            layout="default"
            withBorder={false}
        >
            <AppShell.Header>
                <Box className="h-full flex items-center sm:justify-center border-b-3" sx={{ borderColor: 'var(--app-primary-color)' }}>

                    <Flex h="100%" justify="space-between" align="center" className="w-full md:w-[90%]" px="lg">

                        <Image src={logo} radius="sm" h={50} w="auto" fit="contain" />

                        <Box className="flex items-center gap-2 bg-[var(--app-primary-color)] text-[var(--app-primary-text-color)] p-2 rounded cursor-pointer">
                            <IconInfoSquare size={18} /> Check updates
                        </Box>

                    </Flex>

                </Box>
            </AppShell.Header>

            <AppShell.Main className="flex-grow">
                <Outlet />
            </AppShell.Main>

        </AppShell>
    )
}