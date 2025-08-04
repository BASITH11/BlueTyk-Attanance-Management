
import React, { useRef, useState, useEffect } from "react";
import { IconUser, IconPhone, IconCreditCard, IconEdit, IconCalendar, IconMapPin, IconBriefcase } from '@tabler/icons-react';
import { useFetchMemberById, useFetchMemberImage, useUpdateMember } from "../../queries/members";
import ProfilePlaceholder from '../../assets/images/profile.jpg';
import { useFetchDevices } from "../../queries/device";
import { DateInput } from "@mantine/dates";
import { notify } from "@utils/helpers";
import { useParams } from '@tanstack/react-router';
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
    Skeleton,
    Select
} from "@mantine/core";
import { useForm } from "@mantine/form";

const UpdateMembers = () => {

    const { memberId } = useParams({ strict: false });
    const { data, isLoading } = useFetchMemberById(memberId);
    const member = data?.member ?? {};
    const memberToDevice = member?.member_to_device ?? {}
    const deviceLinked = memberToDevice?.device ?? {}

    //gets all devices
    const { data: devices = [], isError, error } = useFetchDevices();
    const deviceOptions = devices.map(device => ({
        value: String(device.id),
        label: device.device_name,
    }));



    const {
        data: memberImageBlob,
        isLoading: imageLoading,
    } = useFetchMemberImage(member.image)
    const imageUrl = memberImageBlob ? URL.createObjectURL(memberImageBlob) : null;

    const [profileImage, setProfileImage] = useState(ProfilePlaceholder);
    const fileInputRef = useRef(null);

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

    useEffect(() => {
        if (data?.member) {
            form.setValues({
                name: member.name || "",
                phoneNumber: member.phone_no || "",
                cardNumber: member.card_no || "",
                dateOfBirth: member.date_of_birth || "",
                designation: member.designation || "",
                address: member.address || "",
                image: member.image || "",
                deviceId: deviceLinked?.id ? String(deviceLinked.id) : "",
            
            });

            if (memberImageBlob) {
                const imgUrl = URL.createObjectURL(memberImageBlob);
                setProfileImage(imgUrl);

                const filename = member.image?.split("/")?.pop() || "profile.jpg";
                const file = new File([memberImageBlob], filename, { type: memberImageBlob.type });

                // Set the file in the form
                form.setFieldValue("image", file);
            }
        }
    }, [data, memberImageBlob]);


    const addMemberMutation = useUpdateMember();

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("id", memberId);
        formData.append("name", values.name);
        formData.append("phone_no", values.phoneNumber);
        formData.append("card_no", values.cardNumber);
        formData.append("designation", values.designation || "");
        formData.append("address", values.address || "");
        formData.append("date_of_birth", values.dateOfBirth || "");
        formData.append("image", values.image || "");
        formData.append("deviceId",values.deviceId || "");

        console.log(formData.get("image"));

        addMemberMutation.mutate(formData, {
            onSuccess: (data) => {

                notify({
                    title: "Success",
                    message: data.message,
                    iconType: "success",
                });

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
                <IconEdit size={28} />
                <Title order={2}>Update Member</Title>
            </Group>

            <Divider my="md" />

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Grid>
                    <Grid.Col mt='10' span={{ base: 12, md: 6, lg: 4 }}>
                        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                            {imageLoading ? (
                                <Skeleton width={300} height={340} />
                            ) : (
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
                            )}
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
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, index) => (
                                    <Skeleton key={index} height={30} width="100%" />
                                ))
                            ) : (
                                <>
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
                                </>
                            )}

                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                        <Stack spacing="md">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} height={30} width="100%" />
                                ))
                            ) : (
                                <><Textarea
                                    label="Address"
                                    leftSectionPointerEvents="none"
                                    leftSection={<IconMapPin size={18} />}
                                    {...form.getInputProps("address")} />

                                    <TextInput
                                        label="Designation"
                                        leftSectionPointerEvents="none"
                                        leftSection={<IconBriefcase size={18} />}
                                        {...form.getInputProps("designation")} />

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
                                        <Button type="submit">Update</Button>
                                    </Box></>
                            )}

                        </Stack>
                    </Grid.Col>

                </Grid>
            </form>
        </Paper>
    );
};

export default UpdateMembers;
