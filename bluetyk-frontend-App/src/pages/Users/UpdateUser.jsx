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
import { useFetchUserById, useFetchUserAttributes,useUpdateUser} from "../../queries/user";
import { notify } from "@utils/helpers";
import { useSearch } from '@tanstack/react-router';


const UpdateUser = () => {


    const search = useSearch({ from: '/users/user-layout' });
    const userId = search?.userId || null;
    const { data, isLoading } = useFetchUserById(userId);
    const user = data?.user || {};
    const { data: userTypes = {}, isloading } = useFetchUserAttributes();
    const UserTypes = userTypes?.user || [];
    console.log(UserTypes);


    // Form setup
    const form = useForm({
        initialValues: {
            userName: '',
            userEmail: '',
            userType: '',
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
            userType: (value) => (value.length < 1 ? 'User Type is required' : null),

        }
    });

    useEffect(() => {
        if (user?.id) {
            form.setValues({
                userName: user.name || "",
                userEmail: user.email || "",
                userType: user.user_type_id ? String(user.user_type_id) : "",
            });
        }
    }, [user]);


    const UpdateUserMutation = useUpdateUser();

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("id", userId);
        formData.append("name", values.userName);
        formData.append("email", values.userEmail);
        formData.append("user_type_id", values.userType);


        UpdateUserMutation.mutate(formData, {
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

                                        label="User Name"
                                        withAsterisk
                                        leftSectionPointerEvents="none"
                                        leftSection={<IconFingerprint size={18} />}
                                        {...form.getInputProps("userName")}

                                    />
                                    <TextInput
                                        label="User Email"
                                        withAsterisk
                                        leftSectionPointerEvents="none"
                                        leftSection={<IconHash size={18} />}
                                        {...form.getInputProps("userEmail")}

                                    />
                                    <Select
                                        label="User Type"
                                        withAsterisk
                                        placeholder="Select User Type"
                                        {...form.getInputProps("userType")}
                                        data={Array.isArray(UserTypes)
                                            ? UserTypes.map(type => ({
                                                value: String(type.id ?? ""),
                                                label: type.user_post ?? "Unknown",
                                            }))
                                            : []
                                        }
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
export default UpdateUser;