import React, { useState, useEffect } from 'react';

import {
    Paper,
    Tabs,
    Text,
    Group,
    Title
} from '@mantine/core'

import {
    IconAlarmPlus,
    IconEdit,
    IconEyeCheck,
    IconEyeCog,
    IconEyeEdit,
    IconMapPin2
} from '@tabler/icons-react';
import AddShift from './AddShift';
import ViewShift from './ViewShift';
import UpdateShift from './UpdateShift';
import { useSearch } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';



const ShiftLayout = () => {

    const search = useSearch({ from: '/shift/shift-layout' });
    const navigate = useNavigate();

    const shiftId = search?.id || null;

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
            to: '/shift/shift-layout',
            search: {
                tab: value,

            },
        });
    };


    return (
        <Paper p="lg" style={{ backgroundColor: "var(--app-primary-background-color)" }}>
            <Group position="apart" mb="md">
                <div>
                    <Title order={3}>Shift Management</Title>
                    <Text c="dimmed" size="sm">Add or view all registered Shifts</Text>
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
                        leftSection={<IconAlarmPlus size={18} />}
                    >
                        Add Shift
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="view"
                        leftSection={<IconEyeCog size={18} />}
                    >
                        View Shift
                    </Tabs.Tab>


                    {searchTab === "edit" && (
                        <Tabs.Tab value="edit" leftSection={<IconEdit size={18} />} >
                            Update Shift
                        </Tabs.Tab>
                    )}


                </Tabs.List>

                <Tabs.Panel value="add" pt="md">
                    {/* Replace with <AddDevice /> */}
                    <Paper p="md" withBorder >
                        <AddShift />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="view" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >
                        <ViewShift />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="edit" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >
                        <UpdateShift />
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
export default ShiftLayout;