import React from 'react';
import {
    Stack,
    TextInput,
    Paper,
    Button,
    Grid,
    Box,
} from "@mantine/core";
import { IconBuilding } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { useAddDepartment } from "../../queries/department";
import { notify } from "@utils/helpers";


const AddDepartment = () => {

    // Form setup
    const form = useForm({
        initialValues: {
            departmentName: '',
         
        },
        validate: {
            departmentName: (value) => (value.length < 1 ? 'department is required' : null),

        }
    });
    const addDepartmentMutation = useAddDepartment();

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("department_name", values.departmentName);

        addDepartmentMutation.mutate(formData, {
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

                                label="Department Name"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconBuilding size={18} />}
                                {...form.getInputProps("departmentName")}

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
export default AddDepartment;