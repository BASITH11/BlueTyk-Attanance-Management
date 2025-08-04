import React from "react";
import { Paper, Title, Group, Divider, Center, Skeleton, Flex, Badge } from "@mantine/core";
import { IconListDetails, IconEye } from "@tabler/icons-react";
import DataTable from '@components/layout/DataTable';
import { useFetchDevices,useDeleteDevice } from "../../queries/device";
import { useNavigate } from '@tanstack/react-router';





const ViewMembers = () => {


    const { data: devices = [], isLoading, isError, error } = useFetchDevices();

    const { mutate: deleteMutate } = useDeleteDevice();
    const navigate = useNavigate();


    const columns = [
        { accessor: "device_name", label: "Device Name" },
        { accessor: "device_serial_no", label: "Serial Number" },
        {
            accessor: "device_status",
            label: "Status",
            render: (status) => (
                <Badge color={status === 1 ? "green" : "red"} variant="light">
                    {status === 1 ? "Active" : "Inactive"}
                </Badge>
            ),
        }
    ];


    if (isLoading) {
        return (
            <Paper p="xl">
                <Group gap="sm" mb="sm" align="center">
                    <IconListDetails size={28} />
                    <Title order={2}>View Devices</Title>
                </Group>
                <Divider my="md" />

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
        navigate({ to: `/device/deviceEdit/${row.id}` });
    };

    const handleDelete = (row) => {
        deleteMutate(row.id)
    };

    const handleBulkDelete = (ids) => {
        alert("Deleting: " + ids.join(", "));
    };

    const handleView = (row) => {
        navigate({ to: `/device/${row.id}` });
    };

    return (
        <Paper p="xl">
            <Group gap="sm" mb="sm" align="center">
                <IconListDetails size={28} />
                <Title order={2}>View Devices</Title>
            </Group>

            <Divider my="md" />

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
