import React, { useState } from "react";
import { Paper, ActionIcon, Skeleton, Flex, Badge, Text, Loader, Popover } from "@mantine/core";
import { IconEye, IconRefresh, } from "@tabler/icons-react";
import DataTable from '@components/layout/DataTable';
import { useFetchDevices, useDeleteDevice, useSyncDevice } from "../../queries/device";
import { useNavigate } from '@tanstack/react-router';
import { notify } from "@utils/helpers";






const ViewDevices = () => {

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(100);

    const [syncingId, setSyncingId] = useState(null);

    const { data, isLoading, isError, error } = useFetchDevices({ page, perPage });
    const devices = data?.data || [];
    const totalRecords = data?.total || 0;
    const { mutate: deleteMutate } = useDeleteDevice();
    const { mutate: syncMutate } = useSyncDevice();
    const navigate = useNavigate();

    const handleSync = async (id) => {
        setSyncingId(id);

        syncMutate(id, {
            onSuccess: (response) => {
                notify({
                    title: "Success",
                    message: response.message,
                    iconType: "success",
                });
                setSyncingId(null);
            },
        });

    };


    const columns = [
        { accessor: "device_name", label: "Device Name" },
        { accessor: "device_serial_no", label: "Serial Number" },
        { accessor: "last_seen_at", label: "Last Seen" },
        {
            accessor: "device_to_device_type.type",
            label: "Device Type"
        },
        {
            accessor: "device_to_location.location_name",
            label: "Location"
        },
        {
            accessor: "status",
            label: "Status",
            render: (status) => (
                <Badge color={status === 'online' ? "green" : "red"} variant="light" style={{ minWidth: 70, textAlign: "center", whiteSpace: "nowrap", flexShrink: 0, }}>
                    {status === 'online' ? "online" : "offline"}
                </Badge>
            ),
        },
        {
            accessor: "sync",
            label: "Sync",
            render: (value, row) => {
                const [opened, setOpened] = React.useState(false);

                return (
                    <Popover
                        width={200}
                        position="bottom"
                        withArrow
                        shadow="md"
                        opened={opened}
                        onChange={setOpened}
                    >
                        <Popover.Target>
                            <ActionIcon
                                variant="subtle"
                                color="blue"
                                onMouseEnter={() => setOpened(true)}
                                onMouseLeave={() => setOpened(false)}
                                onClick={() => handleSync(row.id)}
                                disabled={syncingId === row.id}
                            >
                                {syncingId === row.id ? (
                                    <Loader size={18} color="blue" />
                                ) : (
                                    <IconRefresh size={18} />
                                )}
                            </ActionIcon>
                        </Popover.Target>

                        <Popover.Dropdown>
                            <Text size="sm">
                                {syncingId === row.id
                                    ? "Syncing in progress..."
                                    : "Click to sync this device"}
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                );
            },
        }


    ];


    if (isLoading) {
        return (
            <Paper p="xl">

                {/* Row of Skeletons - Top Row */}
                <Flex justify="space-between" mb="sm">
                    <Skeleton height={30} width="20%" />
                    <Skeleton height={30} width="20%" />
                </Flex>

                {/* Table Skeleton Rows */}
                <Skeleton height={40} mb="sm" />
                <Skeleton height={40} mb="sm" />
                <Skeleton height={40} mb="sm" />
                <Skeleton height={40} mb="sm" />

            </Paper>
        );

    }



    const handleEdit = (row) => {
        navigate({
            to: '/device/device-layout',
            search: { tab: 'edit', deviceId: row.id }
        });
    };

    const handleDelete = (row) => {
        deleteMutate(row.id)
    };

    const handleBulkDelete = (ids) => {
        alert("Deleting: " + ids.join(", "));
    };

    const handleView = (row) => {
        navigate({
            to: '/device/device-layout',
            search: { tab: 'detail', deviceId: row.id }
        });
    };
    return (
        <Paper p="xl">


            <DataTable
                data={devices}
                columns={columns}
                pageSize={perPage}
                activePage={page}
                totalRecords={totalRecords}
                onPageChange={setPage}
                onPageSizeChange={setPerPage}
                pageSizeOptions={[50, 100, 500, 1000]}
                defaultPageSize={100}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBulkDelete={handleBulkDelete}
                actionOptions={[
                    {
                        label: "View",
                        icon: <IconEye size={16} />,
                        onClick: handleView,
                    },
                ]}
            />
        </Paper>
    );
};

export default ViewDevices;
