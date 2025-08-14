import { React, useEffect } from 'react';
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
    Select,
    Skeleton
} from "@mantine/core";
import { IconEdit, IconFingerprint, IconHash, } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { useFetchDeviceById, useUpdateDevice, useFetchDevicesAttributes } from "../../queries/device";
import { notify } from "@utils/helpers";
import { useSearch } from '@tanstack/react-router';


const UpdateDevice = () => {


    const search = useSearch({ from: '/device/device-layout' });
    const deviceId = search?.deviceId || null;
    const { data, isLoading } = useFetchDeviceById(deviceId);
    const device = data?.device ?? {};

    const { data: devicesAttributes = [], isloading } = useFetchDevicesAttributes();
    const deviceTypes = devicesAttributes?.device_types || [];
    const locations = devicesAttributes?.locations || [];
    // Form setup
    const form = useForm({
        initialValues: {
            deviceName: '',
            serialNumber: '',
            deviceTypes: '',
            locations:'',
        },
        validate: {
            deviceName: (value) => (value.length < 1 ? 'Device name is required' : null),
            serialNumber: (value) => (value.length < 1 ? 'Serial number is required' : null),
            deviceTypes: (value) => (value.length < 1 ? 'device type is required' : null),
            locations: (value) => (value.length < 1 ? 'location is required' : null),
        }
    });

    useEffect(() => {
        if (device?.id) {
            form.setValues({
                deviceName: device.device_name || "",
                serialNumber: device.device_serial_no || "",
                deviceTypes: String(device.device_type_id || ""),
                locations: String(device.location_id || ""),
            });
        }
    }, [device]);


    const UpdateDeviceMutation = useUpdateDevice();

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("id", deviceId);
        formData.append("device_name", values.deviceName);
        formData.append("device_serial_no", values.serialNumber);
        formData.append("device_type_id", values.deviceTypes);
        formData.append("location_id", values.locations);

        UpdateDeviceMutation.mutate(formData, {
            onSuccess: (data) => {
                notify({
                    title: "Success",
                    message: data.message,
                    iconType: "success",
                });
            }
        });
    }


    return (
        <Paper p="xl">

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                        <Stack spacing="md">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton key={index} height={30} width="100%" />
                                ))
                            ) : (
                                <>
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
                                        label="Device Type"
                                        withAsterisk
                                        placeholder="Select Device Type"
                                        {...form.getInputProps("deviceTypes")}
                                        data={deviceTypes?.map((type) => ({
                                            value: String(type.id),
                                            label: type.type
                                        })) || []}
                                    />

                                    <Select
                                        label="Device Location"
                                        withAsterisk
                                        placeholder="Select Device Location"
                                        {...form.getInputProps("locations")}
                                        data={locations?.map((item) => ({
                                            value: String(item.id),
                                            label: item.location_name
                                        })) || []}
                                    />


                                    <Box mt="sm" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button type="submit">Update</Button>
                                    </Box>
                                </>
                            )}


                        </Stack>
                    </Grid.Col>


                </Grid>
            </form>
        </Paper>

    );
}
export default UpdateDevice;