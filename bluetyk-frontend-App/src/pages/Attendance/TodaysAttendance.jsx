import { React, useState } from "react";
import { Paper, TextInput, Select, Group, Button, Flex, Skeleton, Box, Title, Text, ScrollArea, Timeline, ThemeIcon, Badge } from "@mantine/core";
import {
    IconMapPin,
    IconDeviceDesktop,
    IconSearch,
    IconCalendar,
} from "@tabler/icons-react";
import DataTable from "@components/layout/DataTable";
import { useFetchTodaysAttendance } from "../../queries/attendance";
import { useFetchDevicesAttributes, useFetchDevices } from "../../queries/device";
import AttendanceTimeLine from "../../components/layout/AttendanceTimeLine";
import AttendanceAction from "../../components/AttendanceAction";
import { capitalize } from "../../utils/helpers";
import { useAuthStore } from "../../config/authStore";
import { useFetchDepartments } from "../../queries/department";
import { DateInput } from "@mantine/dates";


const ViewTodaysAttendance = () => {
    const [filters, setFilters] = useState({
        name: "",
        location: "",
        device: "",
        from_date: "",
        to_date: ""
    });
    const authenticatedUser = useAuthStore.getState();
    const { data, isFetching } = useFetchTodaysAttendance(filters);
    const { data: deviceAttributes } = useFetchDevicesAttributes();
    const { data: allDevice } = useFetchDevices();
    const locations = deviceAttributes?.locations || [];
    const { data: allDepartments = [] } = useFetchDepartments();

    const columns = [
        { accessor: "device_name", label: "Device" },
        { accessor: "location_name", label: "Location" },
        { accessor: "device_serial_no", label: "Device Serial No" },
        { accessor: "member_name", label: `${capitalize(authenticatedUser.entity)}` },
        { accessor: "department_name", label: "Department" },
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
        },
        {
            accessor: "timeLine",
            label: "Action",
            render: (_, row) => <AttendanceAction row={row} />,
        }
    ];


    return (



        <Paper p="md">

            <ScrollArea type="auto" offsetScrollbars scrollbarSize={6} style={{ minHeight: 60, }}>
                <Group
                    spacing="md"
                    style={{
                        flexWrap: "nowrap",
                        minWidth: "fit-content", // ensures scroll works
                        paddingBottom: 8,
                    }}
                >
                    <TextInput
                        placeholder="Search by Name"
                        value={filters.name}
                        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                        leftSection={<IconSearch size={16} />}
                        style={{ minWidth: 200 }}
                    />

                    <Select
                        placeholder="Select Department"
                        data={allDepartments.map((dep) => ({ value: String(dep.id), label: dep.department_name }))}
                        value={filters.department}
                        onChange={(val) => setFilters({ ...filters, department: val })}
                        clearable
                        leftSection={<IconMapPin size={16} />}
                        style={{ minWidth: 200 }}
                    />


                    <Select
                        placeholder="Select Location"
                        data={locations.map((loc) => ({ value: String(loc.id), label: loc.location_name }))}
                        value={filters.location}
                        onChange={(val) => setFilters({ ...filters, location: val })}
                        clearable
                        leftSection={<IconMapPin size={16} />}
                        style={{ minWidth: 200 }}
                    />

                    <Select
                        placeholder="Select Device"
                        data={allDevice?.map((dev) => ({ value: String(dev.id), label: dev.device_name })) || []}
                        value={filters.device}
                        onChange={(val) => setFilters({ ...filters, device: val })}
                        clearable
                        leftSection={<IconDeviceDesktop size={16} />}
                        style={{ minWidth: 200 }}
                    />

                    <DateInput
                        placeholder="From Date"
                        value={filters.from_date}
                        onChange={(val) => setFilters({ ...filters, from_date: val })}
                        leftSection={<IconCalendar size={16} />}
                        style={{ minWidth: 160 }}
                    />

                    <DateInput
                        placeholder="To Date"
                        value={filters.to_date}
                        onChange={(val) => setFilters({ ...filters, to_date: val })}
                        leftSection={<IconCalendar size={16} />}
                        style={{ minWidth: 160 }}
                    />



                    <Button variant="outline" onClick={() => setFilters({
                        name: "",
                        location: null,
                        device: null,
                    })
                    } style={{ minWidth: 100 }} >
                        Reset
                    </Button>
                </Group>
            </ScrollArea>


            {isFetching ? (
                <>
                    {/* Row of Skeletons - Top Row */}
                    <Flex justify="space-between" mt={100}>
                        <Skeleton height={30} width="20%" />
                        <Skeleton height={30} width="20%" />
                    </Flex>

                    {/* Table Skeleton Rows */}
                    <Box mt={30}>
                        <Skeleton height={40} mb="sm" />
                        <Skeleton height={40} mb="sm" />
                        <Skeleton height={40} mb="sm" />
                        <Skeleton height={40} mb="sm" />
                    </Box>
                </>
            ) : (
                <Box mt={50}>
                    <DataTable
                        data={data}
                        columns={columns}
                        pageSizeOptions={[50, 100, 500, 1000]}
                        defaultPageSize={100}
                    />
                </Box>
            )}
        </Paper>

    );
};

export default ViewTodaysAttendance;
