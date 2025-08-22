import React, { useState, useEffect } from 'react';

import {
    Paper,
    Box,
    Tabs,
    Text,
    Group,
    Title,
    rem
} from '@mantine/core'

import {
    IconUserPlus,
    IconUserCog,
    IconEyeCheck
} from '@tabler/icons-react';

import ViewTodaysAttendance from './TodaysAttendance';
import TodayNonLogged from './TodayNonLogged';
import { useSearch } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { capitalize } from "../../utils/helpers";
import { useAuthStore } from "../../config/authStore";



const AttendanceLayout = () => {

    const search = useSearch({ from: '/attendance/attendance-layout' });
    const navigate = useNavigate();
    const authenticatedUser = useAuthStore.getState();
    const searchTab = search?.tab || 'logged';

    const [activeTab, setActiveTab] = useState(searchTab);

    // Keep tab in sync when URL changes
    useEffect(() => {
        setActiveTab(searchTab);
    }, [searchTab]);

    // Change tab + update URL
    const handleTabChange = (value) => {
        setActiveTab(value);
        navigate({
            to: '/attendance/attendance-layout',
            search: {
                tab: value,

            },
        });
    };


    return (
        <Paper p="lg" style={{ backgroundColor: "var(--app-primary-background-color)" }}>
            <Group position="apart" mb="md">
                <div>
                    <Title order={3}>Todays Attendance Logs</Title>
                    <Text c="dimmed" size="sm">View all logged and non logged {capitalize(authenticatedUser.entity)}</Text>
                </div>
            </Group>

            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="outline"
                radius="md"
                keepMounted={false}
            >
                <Tabs.List >
                    <Tabs.Tab
                        value="logged"
                        leftSection={<IconUserPlus size={18} />}
                    >
                        Logged {capitalize(authenticatedUser.entity)}
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="non-logged"
                        leftSection={<IconUserCog size={18} />}
                    >
                         Non Logged {capitalize(authenticatedUser.entity)}
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="logged" pt="md">
                    {/* Replace with <AddDevice /> */}
                    <Paper p="md" withBorder >
                        <ViewTodaysAttendance />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="non-logged" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >
                        <TodayNonLogged/>
                    </Paper>
                </Tabs.Panel>

            </Tabs>
        </Paper>
    );
}
export default AttendanceLayout;