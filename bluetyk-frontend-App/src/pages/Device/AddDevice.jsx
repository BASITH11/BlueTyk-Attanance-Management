import React from 'react';
import {
    Stack,
    TextInput,
    Paper,
    Divider,
    Button,
    Title,
    Group,
    Grid,
    Box,
    Select
} from "@mantine/core";
import { IconDeviceDesktop, IconFingerprint, IconHash, } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { useAddDevice } from "../../queries/device";
import { notify } from "@utils/helpers";


const AddDevice = () => {

    // Form setup
    const form = useForm({
        initialValues: {
            deviceName: '',
            serialNumber: '',
            status: '',
        },
        validate: {
            deviceName: (value) => (value.length < 1 ? 'Device name is required' : null),
            serialNumber: (value) => (value.length < 1 ? 'Serial number is required' : null),
            status: (value) => (value.length < 1 ? 'Status is required' : null),
        }
    });
    const addDeviceMutation = useAddDevice();

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("device_name", values.deviceName);
        formData.append("device_serial_no", values.serialNumber);
        formData.append("device_status", values.status);

        addDeviceMutation.mutate(formData, {
            onSuccess: (data) => {
                notify({
                    title: "Success",
                    message: data.message,
                    iconType: "success",
                });
                form.reset();
            },
        });
    }


    return (
        <Paper p="xl">
            <Group gap="sm" mb="sm" align="center">
                <IconDeviceDesktop size={28} />
                <Title order={2}>Add Device</Title>
            </Group>

            <Divider my="md" />

            <form  onSubmit={form.onSubmit(handleSubmit)}>
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                        <Stack spacing="md">

                            <TextInput

                                label="Device Name"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconFingerprint size={18} />}
                                {...form.getInputProps("deviceName")}

                            />
                            <TextInput
                                label="Device Serial Number"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconHash size={18} />}
                                {...form.getInputProps("serialNumber")}

                            />
                            <Select
                                label="Device Status"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                placeholder='Select Device Status'
                                {...form.getInputProps("status")}
                                data={[
                                    { value: '1', label: 'Active' },
                                    { value: '0', label: 'Inactive' },
                                ]}
                            />


                            <Box mt="sm" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="submit">Submit</Button>
                            </Box>

                        </Stack>
                    </Grid.Col>


                </Grid>
            </form>
        </Paper>

    );
}
export default AddDevice;