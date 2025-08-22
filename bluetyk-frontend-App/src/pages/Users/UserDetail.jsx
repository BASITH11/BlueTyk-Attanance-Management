import React from "react";
import {
    IconDeviceDesktop, IconFingerprint, IconHash, IconMail, IconMap, IconPower,
    IconTextScan2,
    IconTypeface
} from "@tabler/icons-react";
import {
    Stack,
    Paper,
    Divider,
    Group,
    Text,
    Title,
    Skeleton,
    Grid,
    Box
} from "@mantine/core";
import { useFetchUserById } from "../../queries/user";

import { useSearch } from '@tanstack/react-router';

function UserDetail() {

    const search = useSearch({ from: '/users/user-layout' });
    const userId = search?.userId || null;
    const { data, isLoading } = useFetchUserById(userId);
    const user = data?.user || {};

   console.log(user);

    const fieldStyle = {
        borderBottom: "1px solid #ced4da",
        paddingBottom: 4,
        minWidth: 250,
    };

    return (
        <Paper p="xl">
           

            <Grid>

                <Grid.Col mt='10' span={{ base: 12, md: 6, lg: 4 }}>
                    {isLoading ? (

                        <Stack>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} height={30} width="100%" />
                            ))}
                        </Stack>

                    ) : (
                        <Stack gap="xl">
                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconFingerprint size={18} />
                                <Text fw={700}> User Name:</Text>
                                <Text fw={500} c={user.name?.trim() ? 'black' : 'red'}>
                                    {user.name?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconMail size={18} />
                                <Text fw={700}>User Email:</Text>
                                <Text fw={500} c={user.email?.trim() ? 'black' : 'red'}>
                                    {user.email?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconTypeface size={18} />
                                <Text fw={700}>User Type:</Text>
                                <Text fw={500} c={user.user_type.user_post?.trim() ? 'black' : 'red'}>
                                    {user.user_type.user_post?.trim() || "Not available"}
                                </Text>
                            </Group>

                        </Stack>
                    )}
                </Grid.Col>
            </Grid>
        </Paper>
    );
}

export default UserDetail;
