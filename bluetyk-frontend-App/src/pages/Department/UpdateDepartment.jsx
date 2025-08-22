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
import { IconBuilding } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { useFetchDepartmentById,useUpdateDepartment } from "../../queries/department";
import { notify } from "@utils/helpers";
import { useSearch } from '@tanstack/react-router';


const updateDepartment = () => {

    const search = useSearch({ from: '/department/department-layout' });
    const departmentId = search?.departmentId || null;
    const { data, isLoading } = useFetchDepartmentById(departmentId);
    console.log(data);

    // Form setup
    const form = useForm({
        initialValues: {
            departmentName: '',

        },
        validate: {
            departmentName: (value) => (value.length < 1 ? 'department is required' : null),

        }
    });

    useEffect(() => {
        if (data) {
            form.setValues({
                departmentName: data.department_name || "",

            });
        }
    }, [data]);


    const updateDepartmentMutation = useUpdateDepartment();
    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("id", departmentId);
        formData.append("department_name", values.departmentName);

        updateDepartmentMutation.mutate(formData, {
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

                                label="Department Name"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconBuilding size={18} />}
                                {...form.getInputProps("departmentName")}

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
export default updateDepartment;