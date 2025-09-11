
import React, { useRef, useState, useEffect } from "react";
import { IconUser, IconPhone, IconCreditCard, IconEdit, IconCalendar, IconMapPin, IconBriefcase, IconTrash, IconPlus, IconDeviceDesktop, IconBuilding } from '@tabler/icons-react';
import { useFetchMemberById, useFetchMemberImage, useUpdateMember, useDeleteMemberFromDevice, useFetchUnlinkedDevice, useAssignDevice } from "../../queries/members";
import ProfilePlaceholder from '../../assets/images/dummy-user.jpg';
import { useQueryClient } from "@tanstack/react-query";
import { useFetchDevices } from "../../queries/device";
import { useFetchDepartments } from "../../queries/department";
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
    MultiSelect,
    Checkbox,
    Select
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSearch } from "@tanstack/react-router";
import { capitalize } from "../../utils/helpers";
import { useAuthStore } from "../../config/authStore";

const UpdateMembers = () => {

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(100);
    const search = useSearch({ from: '/members/member-layout' });
    const memberId = search?.memberId || null;
    const { data, isLoading } = useFetchMemberById(memberId);
    const { data: unlinkedDevices = [], isLoading: unlinkedLoading } = useFetchUnlinkedDevice(memberId);
    const member = data?.member ?? {};
    const memberTodevice = member?.member_to_device ?? {};
    const device = memberTodevice?.device ?? {};
    const deleteDeviceMutation = useDeleteMemberFromDevice();
    const queryClient = useQueryClient()
    const { data: departmentResponse = {}, } = useFetchDepartments({ page, perPage });
    const departments = departmentResponse.data || [];


    const authenticatedUser = useAuthStore.getState();

    const [selectedDevices, setSelectedDevices] = useState([]);
    const [deviceAssignments, setDeviceAssignments] = useState({});

    const handleDeviceChange = (selectedDevices) => {
        form.setFieldValue("deviceId", selectedDevices);

        // Add new devices with default values
        const updatedAssignments = { ...deviceAssignments };
        selectedDevices.forEach(deviceId => {
            if (!updatedAssignments[deviceId]) {
                updatedAssignments[deviceId] = { card: 0, finger_print: 0, face_id: 0 };
            }
        });

        // Remove unselected devices
        Object.keys(updatedAssignments).forEach(deviceId => {
            if (!selectedDevices.includes(deviceId)) {
                delete updatedAssignments[deviceId];
            }
        });

        setDeviceAssignments(updatedAssignments);
    };

    const toggleDevice = (deviceId) => {
        setSelectedDevices((prev) =>
            prev.includes(deviceId) ? prev.filter(id => id !== deviceId) : [...prev, deviceId]
        );
    };

    {/*handles bulk deletion and single delteion */ }
    const handleBulkDelete = () => {
        if (selectedDevices.length === 0) return;

        deleteDeviceMutation.mutate({
            member_id: memberId,
            device_ids: selectedDevices
        }, {
            onSuccess: () => setSelectedDevices([]) // clear selection
        });
    };

    const departmentOptions = departments.map(department => ({
        value: String(department.id),
        label: String(department.department_name || 'No department'),
    }));

    {/*get the unlinked devices*/ }

    const deviceOptions = Array.isArray(unlinkedDevices)
        ? unlinkedDevices.map(device => ({
            value: String(device.id),        // MultiSelect requires string values
            label: device.device_name || "Unnamed Device",
        }))
        : [];




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
            deviceId: '',
            departmentId: '',
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
                departmentId: member.department_id ? String(member.department_id) : "",


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
        formData.append("department_id", values.departmentId || "");





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




    const assignDeviceMutation = useAssignDevice();
    const handleAssignDevices = () => {
        if (!form.values.deviceId || form.values.deviceId.length === 0) return;

        const formData = new FormData();
        formData.append("member_id", memberId);

        // Device assignments — send 0/1 like in Add Member
        form.values.deviceId.forEach((id, index) => {
            const assign = deviceAssignments[id] || {};
            formData.append(`device_assignments[${index}][device_id]`, id);
            formData.append(`device_assignments[${index}][card]`, assign.card || 0);
            formData.append(`device_assignments[${index}][finger_print]`, assign.finger_print || 0);
            formData.append(`device_assignments[${index}][face_id]`, assign.face_id || 0);
        });

        // Call mutation
        assignDeviceMutation.mutate(formData, {
            onSuccess: (data) => {
                notify({
                    title: "Success",
                    message: data.message || "Devices assigned successfully",
                    iconType: "success",
                });

                // Reset selection
                form.setFieldValue("deviceId", []);
                setDeviceAssignments({});
                queryClient.invalidateQueries(['unlinkedDevice', memberId]);
            },
        });
    };


    return (
        <Paper p="xl">
            <Group gap="sm" mb="sm" align="center">
                <IconEdit size={28} />
                <Title order={2}>Update {capitalize(authenticatedUser.entity)}</Title>
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
                                        label="Select Department"
                                        withAsterisk
                                        placeholder="Choose a department"
                                        data={departmentOptions}
                                        value={form.values.departmentId || ''}
                                        onChange={(val) => form.setFieldValue("departmentId", val)}
                                        leftSectionPointerEvents="none"
                                        leftSection={<IconBuilding size={18} />}
                                    />



                                    <Box mt="sm" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button type="submit">Update</Button>
                                    </Box></>
                            )}

                        </Stack>
                    </Grid.Col>

                </Grid>
            </form>

            {/*deleting user from device */}
            <Group gap="sm" mt={100} align="center">
                <IconTrash size={28} />
                <Title order={2}>Remove {capitalize(authenticatedUser.entity)}</Title>
            </Group>


            <Divider my="md" />
            <Title order={4} mb="sm" c="var(--app-primary-color)">Linked Devices</Title>
            <Stack spacing="sm">
                {Array.isArray(memberTodevice) &&
                    memberTodevice.map((map) => (
                        <Checkbox
                            variant="outline"
                            key={map.device_id}
                            label={<span style={{ cursor: "pointer" }}>{map.device?.device_name || "Unnamed Device"}</span>}
                            checked={selectedDevices.includes(map.device_id)}
                            onChange={() => toggleDevice(map.device_id)}
                        />
                    ))}
                {Array.isArray(memberTodevice) && memberTodevice.length > 0 && (
                    <Box w={400}>
                        <Box mt="sm" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                style={{ width: 'fit-content' }}
                                disabled={selectedDevices.length === 0}
                                onClick={handleBulkDelete}
                            >
                                Remove
                            </Button>
                        </Box>
                    </Box>
                )}

            </Stack>


            {/*deleting user from device */}
            <Group gap="sm" mt={100} align="center">
                <IconPlus size={28} />
                <Title order={2}>Add To Device</Title>
            </Group>


            <Divider my="md" />

            <Box w={400}>
                <MultiSelect
                    label="Select Device"
                    withAsterisk
                    placeholder="Choose a device"
                    data={deviceOptions}
                    value={form.values.deviceId || []}
                    onChange={(val) => form.setFieldValue("deviceId", val)}
                    leftSectionPointerEvents="none"
                    leftSection={<IconDeviceDesktop size={18} />}
                    disabled={unlinkedLoading}
                />

                {form.values.deviceId.length > 0 && (
                    <Box mt="md">
                        {form.values.deviceId.map(deviceId => {
                            const device = unlinkedDevices.find(d => String(d.id) === String(deviceId));
                            return (
                                <Box key={deviceId} mb="sm" p="sm" style={{ border: '1px solid #ccc', borderRadius: 8 }}>
                                    <strong>{device?.device_name}</strong>
                                    <Group mt="xs">
                                        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <input
                                                type="checkbox"
                                                checked={deviceAssignments[deviceId]?.card === 1}
                                                onChange={(e) =>
                                                    setDeviceAssignments(prev => ({
                                                        ...prev,
                                                        [deviceId]: {
                                                            ...prev[deviceId],
                                                            card: e.target.checked ? 1 : 0
                                                        }
                                                    }))
                                                }
                                            /> Card
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <input
                                                type="checkbox"
                                                checked={deviceAssignments[deviceId]?.finger_print === 1}
                                                onChange={(e) =>
                                                    setDeviceAssignments(prev => ({
                                                        ...prev,
                                                        [deviceId]: {
                                                            ...prev[deviceId],
                                                            finger_print: e.target.checked ? 1 : 0
                                                        }
                                                    }))
                                                }
                                            /> Finger
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <input
                                                type="checkbox"
                                                checked={deviceAssignments[deviceId]?.face_id === 1}
                                                onChange={(e) =>
                                                    setDeviceAssignments(prev => ({
                                                        ...prev,
                                                        [deviceId]: {
                                                            ...prev[deviceId],
                                                            face_id: e.target.checked ? 1 : 0
                                                        }
                                                    }))
                                                }
                                            /> Face
                                        </label>
                                    </Group>
                                </Box>
                            );
                        })}
                    </Box>
                )}

                {unlinkedDevices.length > 0 && (
                    <Box mt="sm" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            color="green"
                            leftSection={<IconPlus size={16} />}
                            disabled={form.values.deviceId.length === 0}
                            onClick={handleAssignDevices}
                        >
                            Add To Device
                        </Button>
                    </Box>
                )}
            </Box>



        </Paper>
    );
};

export default UpdateMembers;
