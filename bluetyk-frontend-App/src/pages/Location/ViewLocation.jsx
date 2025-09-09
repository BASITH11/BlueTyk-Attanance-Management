import { useState } from "react";
import { Paper, Skeleton, Flex } from "@mantine/core";
import DataTable from '@components/layout/DataTable';
import { useFetchLocations, useDeleteLocation } from "../../queries/location";
import { useNavigate } from '@tanstack/react-router';





const ViewLocation = () => {

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(100);

    const { data, isLoading, isError, error } = useFetchLocations({ page, perPage });
    const locations = data?.data || [];
    const totalRecords = data?.total || 0;
    const { mutate: deleteMutate } = useDeleteLocation();
    const navigate = useNavigate();


    const columns = [
        { accessor: "location_name", label: "Location Name" },
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
            to: '/location/location-layout',
            search: { tab: 'edit', locationId: row.id }
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
                data={locations}
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

export default ViewLocation;
