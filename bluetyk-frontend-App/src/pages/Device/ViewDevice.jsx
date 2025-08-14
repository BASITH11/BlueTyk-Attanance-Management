import React from "react";
import { Paper, Title, Group, Divider, Center, Skeleton, Flex, Badge } from "@mantine/core";
import { IconListDetails, IconEye } from "@tabler/icons-react";
import DataTable from '@components/layout/DataTable';
import { useFetchDevices, useDeleteDevice } from "../../queries/device";
import { useNavigate } from '@tanstack/react-router';





const ViewMembers = () => {


    const { data: devices = [], isLoading, isError, error } = useFetchDevices();
    console.log(devices);
    const { mutate: deleteMutate } = useDeleteDevice();
    const navigate = useNavigate();


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
                <Badge color={status === 'online' ? "green" : "red"} variant="light">
                    {status === 'online' ? "online" : "offline"}
                </Badge>
            ),
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
                pageSizeOptions={[5, 10, 25, 50, 100]}
                defaultPageSize={5}
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

export default ViewMembers;
