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
import { useAddDevice, useFetchDevicesAttributes } from "../../queries/device";
import { notify } from "@utils/helpers";


const AddDevice = () => {

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
            deviceTypes: (value) => (value.length < 1 ? 'Device Type is required' : null),
             locations: (value) => (value.length < 1 ? 'Device Location is required' : null),
        }
    });
    const addDeviceMutation = useAddDevice();
    const { data, isloading } = useFetchDevicesAttributes();
    const deviceTypes = data?.device_types || [];
    const locations = data?.locations || [];

    



    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("device_name", values.deviceName);
        formData.append("device_serial_no", values.serialNumber);
        formData.append("device_type_id", values.deviceTypes);
        formData.append("location_id", values.locations);

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

            <form onSubmit={form.onSubmit(handleSubmit)}>
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
                                label="Device Type"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                placeholder='Select Device Type'
                                {...form.getInputProps("deviceTypes")}
                                data={
                                    deviceTypes?.map((type) => ({
                                        value: String(type.id),
                                        label: type.type
                                    })) || []
                                }
                            />

                             <Select
                                label="Device Location"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                placeholder='Select Device Location'
                                {...form.getInputProps("locations")}
                                data={
                                    locations?.map((item) => ({
                                        value: String(item.id),
                                        label: item.location_name
                                    })) || []
                                }
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