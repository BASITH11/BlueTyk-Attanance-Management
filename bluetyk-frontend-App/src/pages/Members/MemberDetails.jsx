import React from "react";
import {
    IconUser,
    IconPhone,
    IconCreditCard, IconCalendar, IconMapPin, IconBriefcase, IconHash, IconPower, IconDeviceDesktop, IconTimeDuration10,
} from "@tabler/icons-react";
import {
    Stack,
    Paper,
    Divider,
    Group,
    Text,
    Title,
    Skeleton,
    Image,
    Grid,
    Box
} from "@mantine/core";
import { useFetchMemberById, useFetchMemberImage } from "../../queries/members";
import ProfilePlaceholder from '../../assets/images/profile.jpg';
import { useParams } from '@tanstack/react-router';

function MemberDetails() {

    const { memberId } = useParams({ strict: false });
    const { data, isLoading } = useFetchMemberById(memberId);
    const member = data?.member ?? {};
    const memberToDevice = member.member_to_device ?? {}
    const  device = memberToDevice.device ?? {}

   

    const {
        data: memberImageBlob,
        isLoading: imageLoading,
    } = useFetchMemberImage(member.image)
    const imageUrl = memberImageBlob ? URL.createObjectURL(memberImageBlob) : null;






    const fieldStyle = {
        borderBottom: "1px solid #ced4da",
        paddingBottom: 4,
        minWidth: 250,
    };

    return (
        <Paper p="xl">
            <Group gap="sm" mb="sm" align="center">
                <IconUser size={28} />
                <Title order={2}>Member Details</Title>
            </Group>

            <Divider my="md" />

            <Grid>
                <Grid.Col mt='10' span={{ base: 12, md: 6, lg: 4 }}>
                    {imageLoading ? (
                        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                            <Skeleton width={300} height={340} />
                        </Box>
                    ) : (
                        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                            <Box

                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: '0.9rem',
                                    width: '300px',
                                    height: '340px',
                                    border: '2px solid #ccc',
                                    backgroundImage: `url("${imageUrl || ProfilePlaceholder}")`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                {/* You can optionally place an icon/text overlay inside here */}
                            </Box>
                        </Box>
                    )}
                </Grid.Col>
                <Grid.Col mt='10' span={{ base: 12, md: 6, lg: 4 }}>
                    {isLoading ? (

                        <Stack>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} height={30} width="100%" />
                            ))}
                        </Stack>

                    ) : (
                        <Stack gap="xl">
                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconUser size={18} />
                                <Text fw={700}>Name:</Text>
                                <Text fw={500} c={member.name?.trim() ? 'black' : 'red'}>
                                    {member.name?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconPhone size={18} />
                                <Text fw={700}>Phone Number:</Text>
                                <Text fw={500} c={member.phone_no?.trim() ? 'black' : 'red'}>
                                    {member.phone_no?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconCreditCard size={18} />
                                <Text fw={700}>Card Number:</Text>
                                <Text fw={500} c={member.card_no?.trim() ? 'black' : 'red'}>
                                    {member.card_no?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconMapPin size={18} />
                                <Text fw={700}> Address:</Text>
                                <Text fw={500} c={member.address?.trim() ? 'black' : 'red'}>
                                    {member.address?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconCalendar size={18} />
                                <Text fw={700}> Date Of Birth:</Text>
                                <Text fw={500} c={member.date_of_birth?.trim() ? 'black' : 'red'}>
                                    {member.date_of_birth?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconBriefcase size={18} />
                                <Text fw={700}> Designation:</Text>
                                <Text fw={500} c={member.designation?.trim() ? 'black' : 'red'}>
                                    {member.designation?.trim() || "Not available"}
                                </Text>
                            </Group>

                        </Stack>
                    )}
                </Grid.Col  >

                <Grid.Col mt='10' span={{ base: 12, md: 6, lg: 4 }}>
                    {isLoading ? (

                        <Stack>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} height={30} width="100%" />
                            ))}
                        </Stack>

                    ) : (
                        <Stack gap="xl">
                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconDeviceDesktop size={18} />
                                <Text fw={700}>Device</Text>
                                <Text fw={500} c={device.device_name?.trim() ? 'black' : 'red'}>
                                    {device.device_name?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconHash size={18} />
                                <Text fw={700}>Serial Number:</Text>
                                <Text fw={500} c={device.device_serial_no?.trim() ? 'black' : 'red'}>
                                    {device.device_serial_no?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconPower size={18} />
                                <Text fw={700}>Status:</Text>
                                <Text fw={500} c={device.device_status === 1 ? 'green' : 'red'}>
                                    {device?.device_status === 1 ? "Active" : "Inactive"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconTimeDuration10 size={18} />
                                <Text fw={700}> Linked At</Text>
                                <Text fw={500} c={memberToDevice.assigned_at?.trim() ? 'black' : 'red'}>
                                    {memberToDevice.assigned_at?.trim() || "Not available"}
                                </Text>
                            </Group>



                        </Stack>
                    )}

                </Grid.Col>
            </Grid>
        </Paper>
    );
}

export default MemberDetails;
