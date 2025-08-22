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
import AddUser from './AddUser';
import ViewUsers from './ViewUser';
import UpdateUser from './UpdateUser';
import UserDetail from './UserDetail';
import { useSearch } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';



const MemberLayout = () => {

    const search = useSearch({ from: '/users/user-layout' });
    const navigate = useNavigate();

    const userId = search?.id || null;

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
            to: '/users/user-layout',
            search: {
                tab: value,

            },
        });
    };


    return (
        <Paper p="lg" style={{ backgroundColor: "var(--app-primary-background-color)" }}>
            <Group position="apart" mb="md">
                <div>
                    <Title order={3}>User Management</Title>
                    <Text c="dimmed" size="sm">Add or view all registered Users</Text>
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
                        leftSection={<IconUserPlus size={18} />}
                    >
                        Add User
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="view"
                        leftSection={<IconUserCog size={18} />}
                    >
                        View User
                    </Tabs.Tab>

                    {searchTab === "detail" && (
                        <Tabs.Tab value="detail" leftSection={<IconEyeCheck size={18} />} >
                            User Detail
                        </Tabs.Tab>
                    )}

                    {searchTab === "edit" && (
                        <Tabs.Tab value="edit" leftSection={<IconEyeCheck size={18} />} >
                            Update User
                        </Tabs.Tab>
                    )}


                </Tabs.List>

                <Tabs.Panel value="add" pt="md">
                    {/* Replace with <AddDevice /> */}
                    <Paper p="md" withBorder >
                        <AddUser />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="view" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >
                        <ViewUsers />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="edit" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >
                        <UpdateUser />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="detail" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >
                        <UserDetail />
                    </Paper>
                </Tabs.Panel>
            </Tabs>
        </Paper>
    );
}
export default MemberLayout;