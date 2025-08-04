import React from "react";
import {
    IconDeviceDesktop, IconFingerprint, IconHash, IconPower
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
import { useFetchDeviceById } from "../../queries/device";

import { useParams } from '@tanstack/react-router';

function DeviceDetails() {

    const { deviceId } = useParams({ strict: false });
    const { data, isLoading } = useFetchDeviceById(deviceId);
    const device = data?.device ?? {};





    const fieldStyle = {
        borderBottom: "1px solid #ced4da",
        paddingBottom: 4,
        minWidth: 250,
    };

    return (
        <Paper p="xl">
            <Group gap="sm" mb="sm" align="center">
                <IconDeviceDesktop size={28} />
                <Title order={2}>Device Details</Title>
            </Group>

            <Divider my="md" />

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
                                <Text fw={700}> Device Name:</Text>
                                <Text fw={500} c={device.device_name?.trim() ? 'black' : 'red'}>
                                    {device.device_name?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconHash size={18} />
                                <Text fw={700}>Serial Number:</Text>
                                <Text fw={500} c={device.device_serial_no?.trim() ? 'black' : 'red'}>
                                    {device.device_serial_no?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconPower size={18} />
                                <Text fw={700}>Status:</Text>
                                <Text fw={500} c={device.device_status === 1 ? 'green' : 'red'}>
                                    {device?.device_status === 1 ? "Active" : "Inactive"}
                                </Text>
                            </Group>

                        </Stack>
                    )}
                </Grid.Col>
            </Grid>
        </Paper>
    );
}

export default DeviceDetails;
