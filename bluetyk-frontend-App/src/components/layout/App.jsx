import { Outlet } from "@tanstack/react-router";
import { AppShell, Box, Text, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Header from "./Header";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { useAuthStore } from "../../config/authStore";


const App = () => {

    const [opened, { toggle }] = useDisclosure(); // controls the navbar in mobile screen
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <AppShell
            header={{ height: { base: 80, sm: 120 } }}
            navbar={{
                width: 250, breakpoint: "sm", collapsed: { mobile: !opened, desktop: true }
            }}
            aside={false}
            layout="default"
            withBorder={false}
            className="min-h-screen flex flex-col"
        >

            <AppShell.Header>
                <Header toggle={toggle} />
            </AppShell.Header>


            <AppShell.Navbar p="sm">
                <Navbar toggle={toggle} />
            </AppShell.Navbar>

            <AppShell.Main className="flex-grow"><Outlet /></AppShell.Main>


            <Box className="relative w-full flex justify-center">
                <Footer />
            </Box>

        </AppShell >
    );
};

export default App;
