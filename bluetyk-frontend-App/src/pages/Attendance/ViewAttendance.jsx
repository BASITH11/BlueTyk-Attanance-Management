import { React, useState } from "react";
import { Paper, TextInput, Select, Group, Button, Flex, Skeleton, Box, Title, Text,ScrollArea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
    IconMapPin,
    IconDeviceDesktop,
    IconCalendar,
    IconSearch,
    IconX,
    IconCheck,
} from "@tabler/icons-react";
import DataTable from "@components/layout/DataTable";
import { useFetchAttendance } from "../../queries/attendance";
import { useFetchDevicesAttributes, useFetchDevices } from "../../queries/device";



const ViewAttendance = () => {
    const [filters, setFilters] = useState({
        name: "",
        location: "",
        device: "",
        from_date: "",
        to_date: ""
    });
    const { data, isFetching } = useFetchAttendance(filters);
    const { data: deviceAttributes } = useFetchDevicesAttributes();
    const { data: allDevice } = useFetchDevices();
    const locations = deviceAttributes?.locations || [];


    const columns = [
        { accessor: "device_name", label: "Device" },
        { accessor: "location_name", label: "Location" },
        { accessor: "device_serial_no", label: "Device Serial No" },
        { accessor: "member_name", label: "Member" }, // now uses the flat key
        { accessor: "timestamp", label: "Time" },
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


    return (
        <Paper
            p="lg"
            style={{ backgroundColor: "var(--app-primary-background-color)" }}
        >
            <Group position="apart" mb="md">
                <div>
                    <Title order={3}>Attendance Logs</Title>
                    <Text c="dimmed" size="sm">View all attendance</Text>
                </div>
            </Group>

            <Paper p="md">

                <ScrollArea
                    type="auto"
                    offsetScrollbars
                    scrollbarSize={6}
                    style={{
                        minHeight: 60,
                    }}
                >
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

                        <Button
                            variant="outline"
                            onClick={() =>
                                setFilters({
                                    name: "",
                                    location: null,
                                    device: null,
                                    from_date: null,
                                    to_date: null,
                                })
                            }
                            style={{ minWidth: 100 }}
                        >
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
                            pageSizeOptions={[5, 10, 25, 50, 100]}
                            defaultPageSize={5}
                        />
                    </Box>
                )}
            </Paper>
        </Paper >
    );
};

export default ViewAttendance;
