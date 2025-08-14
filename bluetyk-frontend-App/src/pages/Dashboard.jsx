import React from "react";
import {
  Box,
  Text,
  Title,
  Paper,
  SimpleGrid,
  Card,
  Group,
  Divider,
  Badge,
} from "@mantine/core";
import { IconUsers, IconDeviceMobile, IconUserShield, IconChartLine } from "@tabler/icons-react";
import { useFetchDashboardDetails } from "../queries/dashboard";
import { useNavigate } from '@tanstack/react-router';



const Dashboard = () => {

  const { data, isLoading, error } = useFetchDashboardDetails();

  const users = data?.total_users ?? 0;
  const inactiveUsers = data?.inactive_users ?? 0;
  const inactiveMembers = data?.inactive_members ?? 0;
  const inactiveDevices = data?.inactive_devices ?? 0;
  const members = data?.total_members ?? 0;
  const device = data?.total_device ?? 0;
  const todaysPunches = data?.todays_punches ?? 0;
  const recentPunches = data?.recent_punches ?? [];

  const navigate = useNavigate();

  function toTitleCase(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const colors = [
    "blue",
    "green",
    "red",
    "cyan",
    "orange"
  ];

  return (
    <Paper size="xl" p="lg" style={{ backgroundColor: "var(--app-primary-background-color)" }}>
      {/* Header */}
      <Box mb="xl">
        <Title order={2}>Dashboard</Title>
        <Text color="dimmed">Here's what's happening today.</Text>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Title fw={500} order={4}>Users</Title>
            <IconUserShield size={34} color="var(--app-primary-color)" />
          </Group>

          {/* Main numbers row */}
          <Group justify="space-between" mt="sm">
            <Text size="xl" fw={700} c="green" style={{ cursor: "pointer" }} onClick={() => navigate({ to: '/users/user-layout', search: { tab: 'view' } })}>
              {users}
            </Text>
            <Text size="xl" fw={700} c="red">
              {inactiveUsers}
            </Text>
          </Group>

          <Group justify="space-between" mt="xs">
            <Text size="xs" c="green">Active</Text>
            <Text size="xs" c="red">Inactive</Text>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Title fw={500} order={4}>Devices</Title>
            <IconDeviceMobile size={34} color="var(--app-primary-color)" />
          </Group>

          {/* Main numbers row */}
          <Group justify="space-between" mt="sm">
            <Text size="xl" fw={700} c="green" style={{ cursor: "pointer" }} onClick={() => navigate({ to: '/device/device-layout', search: { tab: 'view' } })}>
              {device}
            </Text>
            <Text size="xl" fw={700} c="red">
              {inactiveDevices}
            </Text>
          </Group>

          <Group justify="space-between" mt="xs">
            <Text size="xs" c="green">Active</Text>
            <Text size="xs" c="red">Inactive</Text>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Title fw={500} order={4}>Members</Title>
            <IconUsers size={34} color="var(--app-primary-color)" />
          </Group>

          {/* Main numbers row */}
          <Group justify="space-between" mt="sm">
            <Text size="xl" fw={700} c="green" style={{ cursor: "pointer" }} onClick={() => navigate({ to: '/members/member-layout', search: { tab: 'view' } })}>
              {members}
            </Text>
            <Text size="xl" fw={700} c="red">
              {inactiveMembers}
            </Text>
          </Group>

          <Group justify="space-between" mt="xs">
            <Text size="xs" c="green">Active</Text>
            <Text size="xs" c="red">Inactive</Text>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Title fw={500} order={4}>Todays Punches</Title>
            <IconChartLine size={34} color="var(--app-primary-color)" />
          </Group>
          <Text size="xl" fw={700} mt="sm">{todaysPunches} / {members}</Text>
          <Text size="xs" c="blue">Stable</Text>
        </Card>
      </SimpleGrid>

      {/* Recent Activity & Placeholder Chart */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Placeholder for Chart */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">Weekly Users Chart</Title>
          <Box
            h={200}
            bg="gray.1"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 8,
            }}
          >
            <Text c="dimmed">[Chart Placeholder]</Text>
          </Box>
        </Card>

        {/* Recent Activity */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">Recent Activity</Title>
          <Box>
            {recentPunches.length === 0 ? (
              <Text>No recent activity found</Text>
            ) : (
              recentPunches.map((punch,index) => (
                <React.Fragment key={punch.id}>
                  <Group justify="space-between" mb="xs">
                    <Text>
                      User <b>{toTitleCase(punch.member_name || "Unknown")}</b> signed in
                    </Text>
                    <Badge color={colors[index % colors.length]} variant="light">
                      {punch.time_ago}
                    </Badge>
                  </Group>
                  <Divider my="xs" />
                </React.Fragment>
              ))
            )}
          </Box>
        </Card>
      </SimpleGrid>
    </Paper>
  );
};

export default Dashboard;
