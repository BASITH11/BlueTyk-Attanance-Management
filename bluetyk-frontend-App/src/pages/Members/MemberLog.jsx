import React from "react";
import { Paper, ScrollArea, ThemeIcon, Box, Skeleton, Flex, Badge, Text } from "@mantine/core";
import { IconCheck, IconX, IconClock } from "@tabler/icons-react";
import DataTable from '@components/layout/DataTable';
import { useNavigate } from '@tanstack/react-router';
import AttendanceTimeLine from "../../components/layout/AttendanceTimeLine";
import { useAuthStore } from "../../config/authStore";
import { capitalize } from "../../utils/helpers";
import { useFetchMemberLog } from "../../queries/attendance";
import { useSearch } from '@tanstack/react-router';




const MemberLog = () => {
    const authenticatedUser = useAuthStore.getState();
    const search = useSearch({ from: '/members/member-layout' });
    const memberId = search?.memberId || null;
    const { data, isLoading } = useFetchMemberLog(memberId);




    const columns = [
        { accessor: "device_name", label: "Device" },
        { accessor: "location_name", label: "Location" },
        { accessor: "device_serial_no", label: "Device Serial No" },
        { accessor: "member_name", label: `${capitalize(authenticatedUser.entity)}` }, // now uses the flat key
        { accessor: "date", label: "Date" },
        {
            accessor: "attendance_flow",
            label: "Attendance Flow",
            render: (_, row) => (
                <AttendanceTimeLine
                    in_time={row.in_time}
                    out_time={row.out_time}
                    worked_duration={row.worked_duration}
                />
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
