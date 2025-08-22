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
    IconMapPin2
} from '@tabler/icons-react';
import AddDepartment from './AddDepartment';
import ViewDepartment from './ViewDepartment';
import UpdateDepartment from './UpdateDepartment';
import { useSearch } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';



const DepartmentLayout = () => {

    const search = useSearch({ from: '/department/department-layout' });
    const navigate = useNavigate();

    const departmentId = search?.id || null;

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
            to: '/department/department-layout',
            search: {
                tab: value,

            },
        });
    };


    return (
        <Paper p="lg" style={{ backgroundColor: "var(--app-primary-background-color)" }}>
            <Group position="apart" mb="md">
                <div>
                    <Title order={3}>department Management</Title>
                    <Text c="dimmed" size="sm">Add or view all registered departments</Text>
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
                        leftSection={<IconMapPin2 size={18} />}
                    >
                        Add Department
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="view"
                        leftSection={<IconUserCog size={18} />}
                    >
                        View Department
                    </Tabs.Tab>


                    {searchTab === "edit" && (
                        <Tabs.Tab value="edit" leftSection={<IconEyeCheck size={18} />} >
                            Update Department
                        </Tabs.Tab>
                    )}


                </Tabs.List>

                <Tabs.Panel value="add" pt="md">
                    {/* Replace with <AddDevice /> */}
                    <Paper p="md" withBorder >
                        <AddDepartment />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="view" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >
                        <ViewDepartment />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="edit" pt="md">
                    {/* Replace with <ViewDevices /> */}
                    <Paper p="md" withBorder >
                      <UpdateDepartment/>
                    </Paper>
                </Tabs.Panel>

               
            </Tabs>
        </Paper>
    );
}
export default DepartmentLayout;