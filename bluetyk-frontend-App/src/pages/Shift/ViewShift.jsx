import { useState } from "react";
import { Paper, Skeleton, Flex } from "@mantine/core";
import DataTable from '@components/layout/DataTable';
import { useFetchShift, useDeleteShift } from '../../queries/shift';
import { useNavigate } from '@tanstack/react-router';





const ViewShift = () => {

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(100);

    const { data, isLoading, isError, error } = useFetchShift({ page, perPage });
    const shifts = data?.data || [];
    const totalRecords = data?.total || 0;
    const { mutate: deleteMutate } = useDeleteShift();
    const navigate = useNavigate();


    const columns = [
        { accessor: "shift_name", label: "shift Name" },
        { accessor: "shift_start", label: "shift Start" },
        { accessor: "shift_end", label: "shift End" },
        {
            accessor: "is_overnight",
            label: "Shift Type",
            render: (row) => (row.is_overnight ? "Night Shift" : "Day Shift")
        },
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
            to: '/shift/shift-layout',
            search: { tab: 'edit', shiftId: row.id }
        });
    };

    const handleDelete = (row) => {
        deleteMutate(row.id)
    };

    const handleBulkDelete = (ids) => {
        alert("Deleting: " + ids.join(", "));
    };



    return (
        <Paper p="xl">


            <DataTable
                data={shifts}
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

            />
        </Paper>
    );
};

export default ViewShift;
