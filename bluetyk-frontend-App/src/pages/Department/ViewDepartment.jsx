import React from "react";
import { Paper, Skeleton, Flex } from "@mantine/core";
import DataTable from '@components/layout/DataTable';
import { useFetchDepartments, useDeleteDepartment } from "../../queries/department";
import { useNavigate } from '@tanstack/react-router';





const ViewDepartment = () => {


    const { data: departments = [], isLoading, isError, error } = useFetchDepartments();
    const { mutate: deleteMutate } = useDeleteDepartment();
    const navigate = useNavigate();


    const columns = [
        { accessor: "department_name", label: "department Name" },
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
            to: '/department/department-layout',
            search: { tab: 'edit', departmentId: row.id }
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
                data={departments}
                columns={columns}
                pageSizeOptions={[50, 100, 500, 1000]}
                defaultPageSize={100}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBulkDelete={handleBulkDelete}

            />
        </Paper>
    );
};

export default ViewDepartment;
