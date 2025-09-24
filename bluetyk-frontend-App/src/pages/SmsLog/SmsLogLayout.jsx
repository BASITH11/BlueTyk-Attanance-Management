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
    IconMapPin2,
    IconMessage
} from '@tabler/icons-react';
import SmsLogs from './SmsLogs';
import { useSearch } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';



const SmsLogLayout = () => {

    const search = useSearch({ from: '/smslog/smslog-layout' });
    const navigate = useNavigate();

    // const shiftId = search?.id || null;

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
            to: '/smslog/smslog-layout',
            search: {
                tab: value,

            },
        });
    };


    return (
        <Paper p="lg" style={{ backgroundColor: "var(--app-primary-background-color)" }}>
            <Group position="apart" mb="md">
                <div>
                    <Title order={3}>SmsLogs Management</Title>
                    <Text c="dimmed" size="sm">view all SmsLogs</Text>
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
                        leftSection={<IconMessage size={18} />}
                    >
                        Sms Logs
                    </Tabs.Tab>
                    {/* <Tabs.Tab
                        value="view"
                        leftSection={<IconEyeCog size={18} />}
                    >
                        View Shift
                    </Tabs.Tab> */}


                    {searchTab === "edit" && (
                        <Tabs.Tab value="edit" leftSection={<IconEdit size={18} />} >
                            Update Shift
                        </Tabs.Tab>
                    )}


                </Tabs.List>

                <Tabs.Panel value="add" pt="md">
                    {/* Replace with <AddDevice /> */}
                    <Paper p="md" withBorder >
                        <SmsLogs/>
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
export default SmsLogLayout;