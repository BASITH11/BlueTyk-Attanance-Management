import { useState, useEffect } from 'react';

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
    IconDeviceDesktop,
    IconListDetails,
    IconEyeCheck,
    IconEdit 
} from '@tabler/icons-react';
import AddDevice from './AddDevice';
import ViewDevice from './ViewDevice';
import DeviceDetail from './DeviceDetail';
import UpdateDevice from './UpdateDevice';
import { useSearch } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';

const DeviceLayout = () => {


    const search = useSearch({ from: '/device/device-layout' });
    const navigate = useNavigate();

    const deviceId = search?.id || null;

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
            to: '/device/device-layout',
            search: {
                tab: value,
                // Only keep id when detail tab is selected
                id: value === 'detail' ? deviceId : undefined
            },
        });
    };


    return (
        <Paper p="lg" style={{ backgroundColor: "var(--app-primary-background-color)" }}>
            <Group position="apart" mb="md">
                <div>
                    <Title order={3}>Device Management</Title>
                    <Text c="dimmed" size="sm">Add or view all registered devices</Text>
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
                        leftSection={<IconDeviceDesktop size={18} />}
                    >
                        Add Device
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="view"
                        leftSection={<IconListDetails size={18} />}
                    >
                        View Devices
                    </Tabs.Tab>


                    {searchTab === "detail" && (
                        <Tabs.Tab value="detail" leftSection={<IconEyeCheck size={18} />} >
                            Device Detail
                        </Tabs.Tab>
                    )}


                    {searchTab === "edit" && (
                        <Tabs.Tab value="edit" leftSection={<IconEdit size={18} />} >
                            Update Device
                        </Tabs.Tab>
                    )}
                </Tabs.List>

                <Tabs.Panel value="add" pt="md">
                    {/* Replace with <AddDevice /> */}
                    <Paper p="md" withBorder >
                        <AddDevice />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="view" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >
                        <ViewDevice />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="detail" pt="md">
                    {/* Replace with <AddDevice /> */}
                    <Paper p="md" withBorder >
                        <DeviceDetail />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="edit" pt="md">
                    {/* Replace with <AddDevice /> */}
                    <Paper p="md" withBorder >
                        <UpdateDevice />
                    </Paper>
                </Tabs.Panel>

            </Tabs>
        </Paper>
    );
}
export default DeviceLayout;