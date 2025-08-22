import { useState } from "react";
import { ActionIcon, Modal, Text, Timeline, Box, Group, Paper, ThemeIcon, Avatar,Stack } from "@mantine/core";
import { IconEye, IconCheck, IconClock, IconX, IconDeviceLaptop, IconMapPin, IconTimeDuration0} from "@tabler/icons-react";

export default function AttendanceAction({ row }) {
    const [opened, setOpened] = useState(false);

    const totalBreakDuration = row.total_break_duration || "0 hours 0 minutes";

    // Determine out time status
    const outTimeStatus = () => {
        if (!row.out_time || row.out_time === "Not Outed")
            return { color: "red", icon: <IconX size={16} />, label: "Not Outed" };
        if (row.out_time === "Still Working")
            return { color: "orange", icon: <IconClock size={16} />, label: "Still Working" };
        return { color: "green", icon: <IconCheck size={16} />, label: row.out_time };
    };

    return (
        <>
            {/* Table action button */}
            <ActionIcon color="blue" variant="light" onClick={() => setOpened(true)}>
                <IconEye size={18} />
            </ActionIcon>

            {/* Modal */}
            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                size="lg"
                overlayOpacity={0.55}
                overlayBlur={3}
                title={
                    <Group spacing="sm" align="center">
                        <Avatar
                            size={50}
                            radius="xl"
                            src={row.avatar_url || undefined} // Replace with your avatar URL field
                            alt={row.member_name}
                        />
                        <Text weight={500}>{row.member_name || "Unknown"}</Text>
                    </Group>
                }
            >

                <Paper p="sm">
                    <Timeline active={1 + (row.breaks?.length || 0)} bulletSize={24}>
                        {/* In time */}
                        <Timeline.Item
                            title="In Time"
                            bullet={
                                <ThemeIcon size={24} radius="xl" color="blue" variant="filled">
                                    <IconCheck size={14} />
                                </ThemeIcon>
                            }
                        >
                            <Text color="blue">{row.in_time}</Text>
                        </Timeline.Item>

                        {/* Breaks */}
                        {row.breaks?.length > 0 ? (
                            row.breaks.map((b, index) => (
                                <Timeline.Item
                                    key={index}
                                    title={`Break ${index + 1}`}
                                    bullet={
                                        <ThemeIcon size={24} radius="xl" color="orange" variant="filled">
                                            <IconClock size={14} />
                                        </ThemeIcon>
                                    }
                                    lineWidth={3}
                                >
                                    <Group position="apart" noWrap>
                                        <Text>{b.break_start} - {b.break_end}</Text>
                                        <Text color="dimmed">{b.duration}</Text>
                                    </Group>
                                </Timeline.Item>
                            ))
                        ) : (
                            <Timeline.Item
                                title="No Breaks"
                                bullet={
                                    <ThemeIcon size={24} radius="xl" color="gray" variant="filled">
                                        <IconX size={14} />
                                    </ThemeIcon>
                                }
                                lineWidth={3}
                            >
                                <Text>No breaks recorded</Text>
                            </Timeline.Item>
                        )}

                        {/* Out time */}
                        <Timeline.Item
                            title="Out Time"
                            bullet={
                                <ThemeIcon size={24} radius="xl" color={outTimeStatus().color} variant="filled">
                                    {outTimeStatus().icon}
                                </ThemeIcon>
                            }
                            lineWidth={3}
                        >
                            <Text color={outTimeStatus().color}>{outTimeStatus().label}</Text>
                        </Timeline.Item>
                    </Timeline>

                    {/* Summary box */}
                    <Box mt="md" p="sm" sx={{ borderTop: "1px solid #eaeaea" }}>
                        <Stack spacing="md" >
                            {/* Break Duration */}
                            <Group spacing="xs">
                                <IconTimeDuration0 size={20} color="blue" />
                                <Text c="blue">
                                    <Text component="span" color="dimmed">Break Duration: </Text>
                                    {totalBreakDuration}
                                </Text>
                            </Group>

                            {/* Worked Duration */}
                            <Group spacing="xs">
                                <IconClock size={20} color="blue" />
                                <Text c="blue">
                                    <Text component="span" color="dimmed">Worked Duration: </Text>
                                    {row.worked_duration || "Still Working"}
                                </Text>
                            </Group>

                            {/* Device */}
                            <Group spacing="xs">
                                <IconDeviceLaptop size={20} color="blue" />
                                <Text c="blue">
                                    <Text component="span" color="dimmed">Device: </Text>
                                    {row.device_name} ({row.device_serial_no})
                                </Text>
                            </Group>

                            {/* Location */}
                            <Group spacing="xs">
                                <IconMapPin size={20} color="blue" />
                                <Text c="blue">
                                    <Text component="span" color="dimmed">Location: </Text>
                                    {row.location_name}
                                </Text>
                            </Group>
                        </Stack>
                    </Box>
                </Paper>
            </Modal>
        </>
    );
}
