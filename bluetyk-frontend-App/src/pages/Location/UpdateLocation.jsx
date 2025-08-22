import React, { useEffect } from 'react';
import {
    Stack,
    TextInput,
    Paper,
    Button,
    Grid,
    Box,
    Skeleton
} from "@mantine/core";
import { IconPin } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { useFetchLocationById,useUpdateLocation } from "../../queries/location";
import { notify } from "@utils/helpers";
import { useSearch } from '@tanstack/react-router';


const UpdateLocation = () => {

    const search = useSearch({ from: '/location/location-layout' });
    const locationId = search?.locationId || null;
    const { data, isLoading } = useFetchLocationById(locationId);
    console.log(data);

    // Form setup
    const form = useForm({
        initialValues: {
            locationName: '',

        },
        validate: {
            locationName: (value) => (value.length < 1 ? 'location is required' : null),

        }
    });

    useEffect(() => {
        if (data) {
            form.setValues({
                locationName: data.location_name || "",

            });
        }
    }, [data]);


    const UpdateLocationMutation = useUpdateLocation();
    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("id", locationId);
        formData.append("location_name", values.locationName);

        UpdateLocationMutation.mutate(formData, {
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
                                <>
                                    <Skeleton height={40} radius="md" />
                                </> 
                                ):(

                            <TextInput

                                label="Location Name"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconPin size={18} />}
                                {...form.getInputProps("locationName")}

                            />
                            )}

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
export default UpdateLocation;