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
    IconEyeCheck,
    IconMapPin,
    IconMapPin2,
    IconClockPlus,
    IconClockSearch
} from '@tabler/icons-react';
import { useSearch } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';



const HolidayLayout = () => {

    const search = useSearch({ from: '/holidays/holiday-layout' });
    const navigate = useNavigate();

    const holidayId = search?.id || null;

    const searchTab = search?.tab || 'add';

    const [activeTab, setActiveTab] = useState(searchTab);

    // Keep tab in sync when URL changes
    useEffect(() => {
        setActiveTab(searchTab);
    }, [searchTab]);

    // Change tab + update URL
    const handleTabChange = (value) => {
        setActiveTab(value);
        navigate({
            to: '/holidays/holiday-layout',
            search: {
                tab: value,

            },
        });
    };


    return (
        <Paper p="lg" style={{ backgroundColor: "var(--app-primary-background-color)" }}>
            <Group position="apart" mb="md">
                <div>
                    <Title order={3}>Holidays Management</Title>
                    <Text c="dimmed" size="sm">Add or view all registered Holidays</Text>
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
                        value="add"
                        leftSection={<IconClockPlus size={18} />}
                    >
                        Add Holiday
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="view"
                        leftSection={<IconClockSearch size={18} />}
                    >
                        View Holiday
                    </Tabs.Tab>


                    {searchTab === "edit" && (
                        <Tabs.Tab value="edit" leftSection={<IconEyeCheck size={18} />} >
                            Update Holiday
                        </Tabs.Tab>
                    )}


                </Tabs.List>

                <Tabs.Panel value="add" pt="md">
                    {/* Replace with <AddDevice /> */}
                    <Paper p="md" withBorder >

                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="view" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >

                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="edit" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >

                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="detail" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >

                    </Paper>
                </Tabs.Panel>
            </Tabs>
        </Paper>
    );
}
export default HolidayLayout;