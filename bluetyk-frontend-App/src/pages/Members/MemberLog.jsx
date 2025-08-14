import React from "react";
import { Paper, Title, Group, Divider, Center, Skeleton, Flex, Badge } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import DataTable from '@components/layout/DataTable';
import { useNavigate } from '@tanstack/react-router';

import { useFetchMemberLog } from "../../queries/attendance";
import { useSearch } from '@tanstack/react-router';




const MemberLog = () => {

    const search = useSearch({ from: '/members/member-layout' });
    const memberId = search?.memberId || null;
    const { data, isLoading } = useFetchMemberLog(memberId);




    const columns = [
        { accessor: "device_name", label: "Device" },
        { accessor: 'location', label: 'location' },
        { accessor: "time", label: "Time" },
        { accessor: "date", label: "Date" },
        { accessor: "status", label: "Status" },
        {
            accessor: "verified",
            label: "Verified",
            render: (verified) => (
                verified === 1 ? (
                    <IconCheck size={20} color="green" />
                ) : (
                    <IconX size={20} color="red" />
                )
            ),
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





    return (
        <Paper p="xl">

            <DataTable
                data={data}
                columns={columns}
                pageSizeOptions={[5, 10, 25, 50, 100]}
                defaultPageSize={5}
            />
        </Paper>
    );
};

export default MemberLog;
