import { useState } from "react";
import {
    AppShell,
    Container,
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Text,
    Stack,
    Divider,
    Title,
    ScrollArea,
    Group,
    Burger,
    Image,
    Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconEyeCheck, IconEyeOff, IconInfoCircle, IconCheck, IconAlertCircle, IconRocket } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useLogin } from "@queries/auth";
import logo from "../../assets/images/logo.png"; // your logo

const VisibilityToggleIcon = ({ reveal }) =>
    reveal ? <IconEyeOff style={{ fontSize: "8px" }} /> : <IconEyeCheck style={{ fontSize: "8px" }} />;

const Login = () => {
    const [navbarOpened, setNavbarOpened] = useState(false);

    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            email: "",
            password: "",
        },
    });

    const loginResponse = useLogin(form.values.email, form.values.password);
    const handleLogin = () => loginResponse.mutate();

    return (
        <AppShell
            padding={0}
            header={{ height: 0 }}
            navbar={{
                width: 450,
                breakpoint: "sm",
                collapsed: { mobile: !navbarOpened },
            }}
        >
            {/* Header - only on mobile */}
            <AppShell.Header
                hiddenFrom="sm"
                style={{
                    height: 60,
                    backgroundColor: "#7389ebff",
                    color: "white",
                    borderBottom: "1px solid rgba(255,255,255,0.2)",
                    position: "sticky",
                    zIndex: 102,
                }}
            >
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger
                            opened={navbarOpened}
                            onClick={() => setNavbarOpened((o) => !o)}
                            size="sm"
                            color="white"
                        />

                    </Group>
                    <Text size="sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                        Secure Login
                    </Text>
                </Group>
            </AppShell.Header>

            {/* Navbar */}
            <AppShell.Navbar
                p="md"
                style={{
                    backgroundColor: "var(--app-primary-background-color)",
                    color: "white",
                    border: "none",
                    boxShadow: "0 4px 20px #4361ee4d",
                    marginTop: navbarOpened ? 60 : 0,
                }}
            >
                <Title
                    order={2}
                    mb="md"
                    style={{
                        color: " #4362eebe",
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                    }}
                >
                    Latest Updates
                </Title>
                <ScrollArea style={{ height: "100%" }}>
                    <Stack spacing="md">
                        <Alert icon={<IconInfoCircle size={16} />} title="Info" color="blue">
                            Real-time attendance tracking is live.
                        </Alert>

                        <Alert icon={<IconCheck size={16} />} title="Options" color="blue">
                            Detailed attendance reports now available.
                        </Alert>

                        <Alert icon={<IconAlertCircle size={16} />} title="Notice" color="blue">
                            Get notifications for absentees and late entries.
                        </Alert>

                        <Alert icon={<IconRocket size={16} />} title="Update" color="blue">
                            Improved integration with employee management.
                        </Alert>
                    </Stack>
                </ScrollArea>
            </AppShell.Navbar>

            {/* Main content */}
            <AppShell.Main style={{ backgroundColor: "var(--app-primary-background-color)" }}>
                <div className="min-h-[80vh] flex items-center">
                    <Container
                        className="w-full flex justify-center"
                        style={{ backgroundColor: "var(--app-primary-background-color)" }}
                    >
                        <Paper
                            radius="md"
                            p="lg"
                            className="w-full md:w-[55%]"
                            style={{ backgroundColor: "var(--app-primary-background-color)" }}
                        >
                            {/* Desktop logo */}
                            <Image
                                src={logo}
                                alt="MyApp Logo"
                                fit="contain"
                                visibleFrom="xs"
                                mb="md"
                                style={{
                                    margin: "0 auto",
                                    maxHeight: "200px",
                                    width: "auto"
                                }}
                            />

                            <Text size="xl" fw={800} align="center" mb="lg">
                                {("login").toUpperCase()}
                            </Text>

                            <form onSubmit={form.onSubmit(handleLogin)}>
                                <Stack gap={30}>
                                    <TextInput
                                        required
                                        label="Email"
                                        placeholder="Enter your Email"
                                        value={form.values.email}
                                        onChange={(event) =>
                                            form.setFieldValue("email", event.currentTarget.value)
                                        }
                                        error={form.errors.email}
                                        radius={0}
                                        size="md"
                                    />

                                    <PasswordInput
                                        required
                                        label="Password"
                                        placeholder="Enter your password"
                                        value={form.values.password}
                                        onChange={(event) =>
                                            form.setFieldValue("password", event.currentTarget.value)
                                        }
                                        error={form.errors.password}
                                        radius={0}
                                        size="md"
                                        visibilityToggleIcon={VisibilityToggleIcon}
                                    />
                                    <Stack justify="center" gap={15}>
                                        <Button
                                            type="submit"
                                            variant="filled"
                                            fullWidth
                                            color="var(--app-primary-color)"
                                            loading={loginResponse.isLoading}
                                        >
                                            {loginResponse.isLoading ? "Logging in..." : "Login"}
                                        </Button>
                                        <Divider label="Or" labelPosition="center" />
                                        <Text size="sm" ta="center">
                                            Forgot your credentials?{" "}
                                            <Link
                                                to="/auth/forgot-password"
                                                className="text-blue-700"
                                            >
                                                Click here to reset.
                                            </Link>
                                        </Text>
                                    </Stack>
                                </Stack>
                            </form>
                        </Paper>
                    </Container>
                </div>
            </AppShell.Main>
        </AppShell>
    );
};

export default Login;
