import { useState } from "react";
import { Paper, Title, Group, Divider, Center, Skeleton, Flex, Badge } from "@mantine/core";
import { IconListDetails, IconEye } from "@tabler/icons-react";
import DataTable from '@components/layout/DataTable';
import { useFetchUsers, useDeleteUser } from "../../queries/user";
import { useNavigate } from '@tanstack/react-router';





const ViewUsers = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(100);

    const { data, isLoading, isError, error } = useFetchUsers(page, perPage);
    const users = data?.data || [];
    const totalRecords = data?.total || 0;
    const { mutate: deleteMutate } = useDeleteUser();
    const navigate = useNavigate();


    const columns = [
        { accessor: "name", label: "User Name" },
        { accessor: "email", label: "Email" },
        { accessor: "user_type.user_post", label: "Role" },

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
            to: '/users/user-layout',
            search: { tab: 'edit', userId: row.id }
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
            to: '/users/user-layout',
            search: { tab: 'detail', userId: row.id }
        });
    };

    return (
        <Paper p="xl">


            <DataTable
                data={users}
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

export default ViewUsers;
