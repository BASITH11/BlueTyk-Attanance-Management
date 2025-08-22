import React, { useState, useEffect } from 'react';
import {
    Paper,
    Tabs,
    Text,
    Group,
    Title
} from '@mantine/core';
import { IconUserPlus, IconUserCog, IconEyeCheck,IconListDetails, IconFileUpload } from '@tabler/icons-react';
import AddMembers from './AddMembers';
import ViewMembers from './ViewMembers';
import MemberDetails from './MemberDetails';
import MemberLog from './MemberLog';
import UpdateMembers from './UpdateMember';
import BulkAddMember from './BulkAddMember';
import { useAuthStore } from '@config/authStore';
import { capitalize } from '../../utils/helpers';
import { useSearch, useNavigate } from '@tanstack/react-router';

const MemberLayout = () => {
    const authenticatedUser = useAuthStore.getState();
    const search = useSearch({ from: '/members/member-layout' });
    const navigate = useNavigate();

    const memberId = search?.id || null;

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
            to: '/members/member-layout',
            search: {
                tab: value,
                // Only keep id when detail tab is selected
                id: value === 'detail' ? memberId : undefined
            },
        });
    };

    return (
        <Paper p="lg" style={{ backgroundColor: "var(--app-primary-background-color)" }}>
            <Group position="apart" mb="md">
                <div>
                    <Title order={3}>{capitalize(authenticatedUser.entity)} Management</Title>
                    <Text c="dimmed" size="sm">Add or view all registered {capitalize(authenticatedUser.entity)}</Text>
                </div>
            </Group>

            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="outline"
                radius="md"
                keepMounted={false}
            >
                <Tabs.List>
                    <Tabs.Tab  value="add" leftSection={<IconUserPlus size={18} />}>
                        Add {capitalize(authenticatedUser.entity)}
                    </Tabs.Tab>
                    <Tabs.Tab value="view" leftSection={<IconUserCog size={18} />}>
                        View {capitalize(authenticatedUser.entity)}
                    </Tabs.Tab>
                     <Tabs.Tab value="bulkadd" leftSection={<IconFileUpload size={18} />}>
                        Bulk Upload
                    </Tabs.Tab>
                    {searchTab === "detail" && (
                        <Tabs.Tab value="detail" leftSection={<IconEyeCheck size={18} />} >
                            {capitalize(authenticatedUser.entity)} Detail
                        </Tabs.Tab>
                    )}

                    {searchTab === "logs" && (
                        <Tabs.Tab value="logs" leftSection={<IconListDetails size={18} />} >
                            {capitalize(authenticatedUser.entity)} Logs
                        </Tabs.Tab>
                    )}

                    {searchTab === "edit" && (
                        <Tabs.Tab value="edit" leftSection={<IconEyeCheck size={18} />} >
                            Update {capitalize(authenticatedUser.entity)}
                        </Tabs.Tab>
                    )}

                </Tabs.List>

                <Tabs.Panel value="add" pt="md">
                    <Paper p="md" withBorder>
                        <AddMembers />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="view" pt="md">
                    <Paper p="md" withBorder>
                        <ViewMembers />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="detail" pt="md">
                    <Paper p="md" withBorder>
                        <MemberDetails memberId={memberId} />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="logs" pt="md">
                    <Paper p="md" withBorder>
                        <MemberLog />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="edit" pt="md">
                    <Paper p="md" withBorder>
                        <UpdateMembers />
                    </Paper>
                </Tabs.Panel>

                 <Tabs.Panel value="bulkadd" pt="md">
                    <Paper p="md" withBorder>
                        < BulkAddMember/>
                    </Paper>
                </Tabs.Panel>

            </Tabs>
        </Paper>
    );
};
export default MemberLayout;
