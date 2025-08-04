
import React, { useRef, useState } from "react";
import { IconUser, IconPhone, IconCreditCard, IconUserPlus, IconCalendar, IconMapPin, IconBriefcase } from '@tabler/icons-react';
import { useAddMember } from "../../queries/members";
import { useFetchDevices } from "../../queries/device";
import ProfilePlaceholder from '../../assets/images/profile.jpg';
import { DateInput } from "@mantine/dates";
import { notify } from "@utils/helpers";
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
    Textarea,
    Select
} from "@mantine/core";
import { useForm } from "@mantine/form";

const AddMembers = () => {

    const [profileImage, setProfileImage] = useState(ProfilePlaceholder);
    const fileInputRef = useRef(null);

    const { data: devices = [], isLoading, isError, error } = useFetchDevices();
    const deviceOptions = devices.map(device => ({
        value: String(device.id),
        label: device.device_name,
    }));

    // Form setup
    const form = useForm({
        initialValues: {
            name: '',
            phoneNumber: '',
            cardNumber: '',
            dateOfBirth: '',
            designation: '',
            address: '',
            image: '',
            deviceId:'',
        },
        validate: {
            name: (value) => (value.length < 1 ? 'Name is required' : null),
            phoneNumber: (value) => {
                if (!/^\d+$/.test(value)) return 'Phone number must contain only numbers';
                if (value.length < 10) return 'Phone number is invalid';
                return null;
            },

            cardNumber: (value) => {
                if (!/^\d+$/.test(value)) return 'Card number must contain only numbers';
                if (value.length < 1) return 'Card number is required';
                return null;
            },
            dateOfBirth: (value) => new Date(value) >= new Date() ? 'Date of birth must be in the past' : null,
            image: (value) => {
                if (!value) return null;
                if (value.size > 5 * 1024 * 1024) return 'Image size must be less than 5MB';
                return null;
            }

        }
    });

    const addMemberMutation = useAddMember();

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("phone_no", values.phoneNumber);
        formData.append("card_no", values.cardNumber);
        formData.append("designation", values.designation || "");
        formData.append("address", values.address || "");
        formData.append("date_of_birth", values.dateOfBirth || "");
        formData.append("image", values.image || "");
        formData.append("deviceId",values.deviceId|| "");



        addMemberMutation.mutate(formData, {
            onSuccess: (data) => {

                notify({
                    title: "Success",
                    message: data.message,
                    iconType: "success",
                });
                form.reset(); // Works now because it's in scope
                setProfileImage(ProfilePlaceholder);

            },
        });


    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setFieldValue("image", file);
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);

        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Paper p="xl">
            <Group gap="sm" mb="sm" align="center">
                <IconUserPlus size={28} />
                <Title order={2}>Add Member</Title>
            </Group>

            <Divider my="md" />

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Grid>
                    <Grid.Col mt='10' span={{ base: 12, md: 6, lg: 4 }}>
                        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                            <Box
                                onClick={handleImageClick}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: '0.9rem',
                                    width: '300px',
                                    height: '300px',
                                    border: '2px solid #ccc',
                                    backgroundImage: `url(${profileImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                {/* You can optionally place an icon/text overlay inside here */}
                            </Box>
                        </Box>

                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/gif"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                        />


                    </Grid.Col>


                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                        <Stack spacing="md">

                            <TextInput

                                label="Full Name"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconUser size={18} />}
                                {...form.getInputProps("name")}
                            />
                            <TextInput
                                label="Phone Number"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconPhone size={18} />}
                                {...form.getInputProps("phoneNumber")}
                            />
                            <TextInput
                                label="Card Number"
                                withAsterisk
                                leftSectionPointerEvents="none"
                                leftSection={<IconCreditCard size={18} />}
                                {...form.getInputProps("cardNumber")}
                            />
                            <DateInput
                                label="Date of Birth"
                                leftSectionPointerEvents="none"
                                leftSection={<IconCalendar size={18} />}
                                {...form.getInputProps("dateOfBirth")}
                            />


                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                        <Stack spacing="md">
                            <Textarea
                                label="Address"
                                leftSectionPointerEvents="none"
                                leftSection={<IconMapPin size={18} />}
                                {...form.getInputProps("address")}
                            />

                            <TextInput
                                label="Designation"
                                leftSectionPointerEvents="none"
                                leftSection={<IconBriefcase size={18} />}
                                {...form.getInputProps("designation")}
                            />

                            <Select
                                label="Select Device"
                                withAsterisk
                                placeholder="Choose a device"
                                data={deviceOptions}
                                leftSectionPointerEvents="none"
                                leftSection={<IconUser size={18} />}
                                {...form.getInputProps("deviceId")}
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
};

export default AddMembers;
