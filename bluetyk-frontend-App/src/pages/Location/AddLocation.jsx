import React from 'react';
import {
    Stack,
    TextInput,
    Paper,
    Button,
    Grid,
    Box,
} from "@mantine/core";
import { IconPin } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { useAddLocation } from "../../queries/location";
import { notify } from "@utils/helpers";


const AddLocation = () => {

    // Form setup
    const form = useForm({
        initialValues: {
            locationName: '',
         
        },
        validate: {
            locationName: (value) => (value.length < 1 ? 'location is required' : null),

        }
    });
    const addLocationMutation = useAddLocation();

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("location_name", values.locationName);

        addLocationMutation.mutate(formData, {
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

                                label="Location Name"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconPin size={18} />}
                                {...form.getInputProps("locationName")}

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
export default AddLocation;