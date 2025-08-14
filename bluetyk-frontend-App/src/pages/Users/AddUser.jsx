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
import { useAddUser, useFetchUserAttributes } from "../../queries/user";
import { notify } from "@utils/helpers";


const AddUser = () => {

    // Form setup
    const form = useForm({
        initialValues: {
            userName: '',
            userEmail: '',
            userTypes: '',
            userPassword: '',
        },
        validate: {
            userName: (value) => (value.length < 1 ? 'Name is required' : null),
            userEmail: (value) => {
                if (!value || value.trim().length < 1) {
                    return 'Email is required';
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return 'Please enter a valid email address';
                }
                return null;
            },
            userTypes: (value) => (value.length < 1 ? 'Device Type is required' : null),
            userPassword: (value) => {
                if (!value || value.trim().length < 1) {
                    return 'Password is required';
                }
                if (value.length < 6) {
                    return 'Password must be at least 6 characters long';
                }
                return null;
            }
        }
    });
    const addUserMutation = useAddUser();
    const { data, isloading } = useFetchUserAttributes();
    const UserTypes = data?.user || [];






    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("name", values.userName);
        formData.append("email", values.userEmail);
        formData.append("user_type_id", values.userTypes);
        formData.append("password", values.userPassword);

        addUserMutation.mutate(formData, {
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

                                label="User Name"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconFingerprint size={18} />}
                                {...form.getInputProps("userName")}

                            />
                            <TextInput
                                label="user Email"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconHash size={18} />}
                                {...form.getInputProps("userEmail")}

                            />
                            <Select
                                label="User Type"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                placeholder='Select User Type'
                                {...form.getInputProps("userTypes")}
                                data={
                                    UserTypes?.map((type) => ({
                                        value: String(type.id),
                                        label: type.user_post
                                    })) || []
                                }
                            />

                            <TextInput
                                label="Password"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconHash size={18} />}
                                {...form.getInputProps("userPassword")}

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
export default AddUser;