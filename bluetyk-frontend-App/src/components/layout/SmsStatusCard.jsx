// src/components/layout/SmsStatsCards.jsx
import { SimpleGrid, Card, Group, Title, Text } from "@mantine/core";
import { IconDownload, IconCircleCheck, IconDeviceDesktop } from "@tabler/icons-react";

const SmsStatsCard = ({ totalSms, successCount, failureCount, totalPunches }) => {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                    <Title fw={500} order={4}>Total SMS</Title>
                    <IconDownload size={34} color="var(--app-primary-color)" />
                </Group>
                <Text size="xl" fw={700} mt="sm">{totalSms}</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                    <Title fw={500} order={4}>Success</Title>
                    <IconCircleCheck size={34} color="green" />
                </Group>
                <Text size="xl" fw={700} mt="sm">{successCount}</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                    <Title fw={500} order={4}>Failed</Title>
                    <IconCircleCheck size={34} color="red" />
                </Group>
                <Text size="xl" fw={700} mt="sm">{failureCount}</Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                    <Title fw={500} order={4}>Total Punches</Title>
                    <IconDeviceDesktop size={34} color="orange" />
                </Group>
                <Text size="xl" fw={700} mt="sm">{totalPunches}</Text>
            </Card>
        </SimpleGrid>
    );
};

export default SmsStatsCard;
