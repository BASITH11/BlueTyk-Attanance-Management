
import React, { useRef, useState } from "react";
import { IconUser, IconPhone, IconCreditCard, IconUserPlus, IconCalendar, IconMapPin, IconBriefcase, IconBuilding } from '@tabler/icons-react';
import { useAddMember } from "../../queries/members";
import { useFetchDevices } from "../../queries/device";
import { useFetchDepartments } from "../../queries/department";
import { useFetchShift } from "../../queries/shift";
import ProfilePlaceholder from '../../assets/images/dummy-user.jpg';
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
    Select,
    MultiSelect
} from "@mantine/core";
import { useForm } from "@mantine/form";

const AddMembers = () => {

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(100);

    const [profileImage, setProfileImage] = useState(ProfilePlaceholder);
    const fileInputRef = useRef(null);
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

    const { data: deviceResponse = {}, isLoading, isError, error } = useFetchDevices({ page: 1, perPage: 100 });
    const devices = deviceResponse.data || [];
    const { data: departmentResponse = {} } = useFetchDepartments({ page: 1, perPage: 100 });
    const departments = departmentResponse.data || [];
    const { data: shiftResponse = {} } = useFetchShift({ page: 1, perPage: 100 })
    const shifts = shiftResponse.data || [];




    const deviceOptions = devices.map(device => ({
        value: String(device.id),
        label: `${device.device_name} (${device.device_to_location?.location_name || 'No Location'})`,
    }));

    const departmentOptions = departments.map(department => ({
        value: String(department.id),
        label: String(department.department_name || 'No department'),
    }));

    const ShiftOptions = shifts.map(shift => ({
        value: String(shift.id),
        label: String(shift.shift_name || 'No shift'),
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
            deviceId: [],
            departmentId: '',
            shiftId: '',
        },
        validate: {
            name: (value) => (value.length < 1 ? 'Name is required' : null),
            phoneNumber: (value) => {
                if (!/^\d+$/.test(value)) return 'Phone number must contain only numbers';
                // if (value.length < 10) return 'Phone number is invalid';
                return null;
            },

            cardNumber: (value) => {
                if (!/^\d+$/.test(value)) return 'Card number must contain only numbers';
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
        formData.append("department_id", values.departmentId || "");
        formData.append("shift_id", values.shiftId || "");


        // Device assignments
        values.deviceId.forEach((id, index) => {
            const assign = deviceAssignments[id] || {};
            formData.append(`device_assignments[${index}][device_id]`, id);
            formData.append(`device_assignments[${index}][card]`, assign.card || 0);
            formData.append(`device_assignments[${index}][finger_print]`, assign.finger_print || 0);
            formData.append(`device_assignments[${index}][face_id]`, assign.face_id || 0);
        });


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
                            <Textarea
                                label="Address"
                                leftSectionPointerEvents="none"
                                leftSection={<IconMapPin size={18} />}
                                {...form.getInputProps("address")}
                            />



                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                        <Stack spacing="md">
                            <DateInput
                                label="Date of Birth"
                                leftSectionPointerEvents="none"
                                leftSection={<IconCalendar size={18} />}
                                {...form.getInputProps("dateOfBirth")}
                            />

                            <TextInput
                                label="Designation"
                                leftSectionPointerEvents="none"
                                leftSection={<IconBriefcase size={18} />}
                                {...form.getInputProps("designation")}
                            />

                            <Select
                                label="Select Department"
                                withAsterisk
                                placeholder="Choose a department"
                                data={departmentOptions}
                                leftSectionPointerEvents="none"
                                leftSection={<IconBuilding size={18} />}
                                {...form.getInputProps("departmentId")}
                            />
                            <Select
                                label="Select Shift"
                                withAsterisk
                                placeholder="Choose a shift"
                                data={ShiftOptions}
                                leftSectionPointerEvents="none"
                                leftSection={<IconBuilding size={18} />}
                                {...form.getInputProps("shiftId")}
                            />

                            <MultiSelect
                                label="Select Device"
                                withAsterisk
                                placeholder="Choose a device"
                                data={deviceOptions}
                                leftSectionPointerEvents="none"
                                leftSection={<IconUser size={18} />}
                                {...form.getInputProps("deviceId")}
                            />

                            {form.values.deviceId.length > 0 && (
                                <Box mt="md">
                                    {form.values.deviceId.map(deviceId => {
                                        const device = devices.find(d => String(d.id) === String(deviceId));
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
