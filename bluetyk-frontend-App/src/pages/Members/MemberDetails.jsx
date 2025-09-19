import React from "react";
import {
    IconUser,
    IconPhone,
    IconCreditCard, IconCalendar, IconMapPin, IconBriefcase, IconCheck, IconPower, IconDeviceDesktop, IconTimeDuration10,
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
import ProfilePlaceholder from '../../assets/images/dummy-user.jpg';
import { useSearch } from '@tanstack/react-router';

function MemberDetails() {

    const search = useSearch({ from: '/members/member-layout' });
    const memberId = search?.memberId || null;
    const { data, isLoading } = useFetchMemberById(memberId);
    const member = data?.member ?? {};
    const memberToDevice = member.member_to_device ?? {}
    const device = member.member_to_device?.map(item => item.device) ?? [];





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
                                <Text fw={700}> Department:</Text>
                                <Text fw={500} c={member.department.department_name?.trim() ? 'black' : 'red'}>
                                    {member.department.department_name?.trim() || "Not available"}
                                </Text>
                            </Group>


                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconBriefcase size={18} />
                                <Text fw={700}> Designation:</Text>
                                <Text fw={500} c={member.designation?.trim() ? 'black' : 'red'}>
                                    {member.designation?.trim() || "Not available"}
                                </Text>
                            </Group>

                            <Group align="center" gap="xs" style={fieldStyle}>
                                <IconBriefcase size={18} />
                                <Text fw={700}> Shift:</Text>
                                <Text fw={500} c={member.shift.shift_name?.trim() ? 'black' : 'red'}>
                                    {member.shift.shift_name?.trim() || "Not available"}
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
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            {isLoading ? (
                                <Stack>
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <Skeleton key={index} height={30} width="100%" />
                                    ))}
                                </Stack>
                            ) : device.length > 0 ? (
                                <Stack gap="sm">
                                    <Group align="center" gap="xs" style={fieldStyle}>
                                        <IconDeviceDesktop size={18} />
                                        <Text fw={700}>Devices:</Text>
                                    </Group>

                                    <Stack spacing={4} pl={28}> {/* indent to align with the label */}
                                        {device.map((dev, index) => (
                                            <Group key={index} spacing="xs">
                                                <IconCheck size={16} color="green" /> {/* tick icon */}
                                                <Text fw={500}>{dev.device_name || "Not available"}</Text>
                                            </Group>
                                        ))}
                                    </Stack>
                                </Stack>
                            ) : (
                                <Stack>
                                    <Group align="center" gap="xs" style={fieldStyle}>
                                        <IconDeviceDesktop size={18} />
                                        <Text fw={700}>Devices:</Text>
                                    </Group>
                                    <Text pl={28}>No devices linked.</Text>
                                </Stack>
                            )}
                        </Grid.Col>
                    )}

                </Grid.Col>
            </Grid>
        </Paper>
    );
}

export default MemberDetails;
