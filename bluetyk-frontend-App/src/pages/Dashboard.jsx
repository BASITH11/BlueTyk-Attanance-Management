import React from "react";
import {
  Box,
  Text,
  Title,
  Paper,
  SimpleGrid,
  Card,
  Group,
  Avatar,
  Button,
  Badge
} from "@mantine/core";
import { IconUsers, IconDeviceMobile, IconUserShield, IconChartLine, IconDotsVertical } from "@tabler/icons-react";
import { useFetchDashboardDetails } from "../queries/dashboard";
import { useNavigate } from '@tanstack/react-router';
import LoadingComponent from "../components/layout/loadingComponent";




const Dashboard = () => {

  const { data, isLoading, error } = useFetchDashboardDetails();

  const users = data?.total_users ?? 0;
  const inactiveUsers = data?.inactive_users ?? 0;
  const inactiveMembers = data?.inactive_members ?? 0;
  const inactiveDevices = data?.inactive_devices ?? 0;
  const members = data?.total_members ?? 0;
  const device = data?.total_device ?? 0;
  const todaysPunches = data?.todays_punches ?? 0;
  const recentPunches = data?.recent_entries ?? [];
  console.log(recentPunches);


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
    <>
      <LoadingComponent visible={isLoading}>
        <Paper size="xl" p="lg" style={{ backgroundColor: "var(--app-primary-background-color)" }}>
          {/* Header */}
          <Box mb="xl">
            <Title order={2}>Dashboard</Title>
            <Text color="dimmed">Here's what's happening today.</Text>
          </Box>

          {/* Stats Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">

            <Card shadow="sm" padding="lg" radius="md" style={{ cursor: "pointer" }} withBorder onClick={() => {
              navigate({ to: '/attendance/attendance-layout', search: { tab: 'logged' } })
            }}>
              <Group justify="space-between">
                <Title fw={500} order={4}>Todays Punches</Title>
                <IconChartLine size={34} color="var(--app-primary-color)" />
              </Group>
              <Text size="xl" fw={700} mt="sm">{todaysPunches} / {members}</Text>
              <Text size="xs" c="blue"></Text>
            </Card>


            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ cursor: "pointer" }} onClick={() => navigate({ to: '/members/member-layout', search: { tab: 'view' } })}>
              <Group justify="space-between">
                <Title fw={500} order={4}>Members</Title>
                <IconUsers size={34} color="var(--app-primary-color)" />
              </Group>

              {/* Main numbers row */}
              <Group justify="space-between" mt="sm">
                <Text size="xl" fw={700} c="green" >
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



            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ cursor: "pointer" }} onClick={() => navigate({ to: '/device/device-layout', search: { tab: 'view' } })}>
              <Group justify="space-between">
                <Title fw={500} order={4}>Devices</Title>
                <IconDeviceMobile size={34} color="var(--app-primary-color)" />
              </Group>

              {/* Main numbers row */}
              <Group justify="space-between" mt="sm">
                <Text size="xl" fw={700} c="green"  >
                  {device}
                </Text>
                <Text size="xl" fw={700} c="red">
                  {inactiveDevices}
                </Text>
              </Group>

              <Group justify="space-between" mt="xs">
                <Text size="xs" c="green">Online</Text>
                <Text size="xs" c="red">Offline</Text>
              </Group>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ cursor: "pointer" }} onClick={() => navigate({ to: '/users/user-layout', search: { tab: 'view' } })}>
              <Group justify="space-between">
                <Title fw={500} order={4}>Users</Title>
                <IconUserShield size={34} color="var(--app-primary-color)" />
              </Group>

              {/* Main numbers row */}
              <Group justify="space-between" mt="sm">
                <Text size="xl" fw={700} c="green" >
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
                  recentPunches.map((entry) => (
                    <Card
                      key={entry.id}
                      mb="sm"
                      p="sm"
                      shadow="sm" padding="lg" radius="md" withBorder
                    >
                      {/* Top-right badge */}
                      <Badge
                        color={entry.out_time && entry.out_time !== "Still Working" ? "red" : "green"}
                        variant="light"
                        style={{ position: "absolute", top: 10, right: 10 }}
                      >
                        {entry.out_time && entry.out_time !== "Still Working" ? "Out of Office" : "In Office"}
                      </Badge>

                      <Group noWrap align="center">
                        <Avatar color="blue" radius="xl" size={50}>
                          {entry.member_name?.[0]?.toUpperCase() || "U"}
                        </Avatar>
                        <Box>
                          <Text style={{ fontWeight: 700 }}>{entry.member_name}</Text>

                          <Text size="sm">
                            <Text component="span" color="green">
                              In: {entry.in_time}
                            </Text>{" "}
                            |{" "}
                            <Text
                              component="span"
                              color={entry.out_time === "Still Working" ? "red" : "gray"}
                            >
                              Out: {entry.out_time}
                            </Text>
                          </Text>
                        </Box>
                      </Group>
                    </Card>

                  ))
                )}

              </Box>

              {/* More Button */}
              {recentPunches.length > 0 && (
                <Box mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    leftSection={<IconDotsVertical size={16} />}
                    variant="outline"
                    onClick={() => {
                      navigate({ to: '/attendance/attendance-layout', })
                    }}
                  >
                    More
                  </Button>
                </Box>
              )}
            </Card>
          </SimpleGrid>
        </Paper>
      </LoadingComponent>
    </>
  );
};

export default Dashboard;
