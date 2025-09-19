import { React, useState } from "react";
import { Paper, TextInput, Select, Group, Button, Flex, Skeleton, Box, Checkbox, Text, ScrollArea, Timeline, ThemeIcon, Badge, } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
    IconMapPin,
    IconDeviceDesktop,
    IconSearch,
    IconCalendar
} from "@tabler/icons-react";
import DataTable from "@components/layout/DataTable";
import { useFetchTodaysAttendanceNotLogged } from "../../queries/attendance";
import { useFetchDevicesAttributes, useFetchDevices } from "../../queries/device";
import { useFetchDepartments } from "../../queries/department";
import { useSendSms } from "../../queries/sms";
import { notify } from "@utils/helpers";




const TodayNonLogged = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(100);
    const [filters, setFilters] = useState({
        name: "",
        location: "",
        device: "",
        date: ""
    });
    const [selectedMembers, setSelectedMembers] = useState([]);
    const { data, isFetching, refetch } = useFetchTodaysAttendanceNotLogged({ filters, page, perPage });
    const nonLoggedMembers = data?.data ?? [];
    const totalRecords = data?.total || 0;
    const { data: deviceAttributes } = useFetchDevicesAttributes();
    const { data: allDeviceResponse = {} } = useFetchDevices({ page: 1, perPage: 100 });
    const allDevice = allDeviceResponse?.data || [];
    const locations = deviceAttributes?.locations || [];
    const { data: allDepartmentsResponse = {} } = useFetchDepartments({ page: 1, perPage: 100 });
    const allDepartments = allDepartmentsResponse?.data || [];
    // Check if any row has can_send_sms = true
    const hasCanSendSMS = nonLoggedMembers.some(row => row.can_send_sms === true);
    console.log(hasCanSendSMS);


    const sentSms = useSendSms();

    const handleSendSMS = (member) => {
        // Determine if sending multiple members or a single one
        const payload = Array.isArray(member)
            ? {
                members: member.map(m => ({
                    member_id: m.member_id,
                    name: m.name,
                    department: m.department_name,
                    mobile: m.phone_no
                }))
            }
            : {
                member_id: member.member_id,
                name: member.name,
                department: member.department_name,
                mobile: member.phone_no
            };

        sentSms.mutate(payload, {
            onSuccess: (data) => {
                notify({
                    title: "Success",
                    message: data.message,
                    iconType: "success",
                });
                refetch();
                // Clear selection after bulk send
                if (Array.isArray(member)) setSelectedMembers([]);
            },
        });
    };




    const columns = [
        {
            accessor: "select",
            label: (
                hasCanSendSMS ? (
                    <Checkbox
                        checked={
                            selectedMembers.length === nonLoggedMembers.filter(r => r.can_send_sms).length &&
                            nonLoggedMembers.some(r => r.can_send_sms)
                        }
                        indeterminate={
                            selectedMembers.length > 0 &&
                            selectedMembers.length < nonLoggedMembers.filter(r => r.can_send_sms).length
                        }
                        onChange={(e) => {
                            if (e.currentTarget.checked) {
                                setSelectedMembers(nonLoggedMembers.filter(r => r.can_send_sms)); // select only those with can_send_sms
                            } else {
                                setSelectedMembers([]);
                            }
                        }}
                    />
                ) : null
            ),
            render: (_, row) =>
                row.can_send_sms ? (
                    <Checkbox
                        checked={selectedMembers.some((m) => m.member_id === row.member_id)}
                        onChange={(e) => {
                            if (e.currentTarget.checked) {
                                setSelectedMembers([...selectedMembers, row]);
                            } else {
                                setSelectedMembers(
                                    selectedMembers.filter((m) => m.member_id !== row.member_id)
                                );
                            }
                        }}
                    />
                ) : null, // hide checkbox if not allowed
        },
        { accessor: "name", label: "Name" },
        { accessor: "device_name", label: "Device" },
        { accessor: "location_name", label: "Location" },
        { accessor: "department_name", label: "Department" },
        { accessor: "remark", label: "Remark" },
        {
            accessor: "device_status",
            label: "Device Status",
            render: (device_status) => (
                <Badge
                    color={device_status.toLowerCase() === 'online' ? "green" : "red"}
                    variant="light"
                    style={{ minWidth: 70, textAlign: "center", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                    {device_status.toLowerCase() === 'online' ? "online" : "offline"}
                </Badge>
            ),
        },
        ...(hasCanSendSMS
            ? [{
                accessor: "action",
                label: "Action",
                render: (_, row) => {
                    if (row.sms_sent) {
                        return (
                            <Badge color="gray" variant="light">
                                SMS Sent
                            </Badge>
                        );
                    }

                    if (row.can_send_sms) {
                        return (
                            <Button
                                size="xs"
                                color="blue"
                                variant="outline"
                                onClick={() => handleSendSMS(row)}
                            >
                                Send SMS
                            </Button>
                        );
                    }

                    return (
                        <Badge color="red" variant="light">
                            Not available
                        </Badge>
                    );
                },
            }]
            : [])

    ];


    return (



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
                        minWidth: "fit-content",
                        paddingBottom: 8,
                    }}
                >
                    <DateInput
                        placeholder="Date"
                        value={filters.date}
                        onChange={(val) => setFilters({ ...filters, date: val })}
                        leftSection={<IconCalendar size={16} />}
                        style={{ minWidth: 160 }}
                    />

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

                    <Button variant="outline" onClick={() => {
                        setFilters({
                            name: "",
                            location: null,
                            device: null,
                            department: null,
                            date: null,
                        })
                        refetch();
                    }}
                        style={{ minWidth: 100 }}
                    >
                        Reset
                    </Button>
                </Group>
            </ScrollArea>


            {
                isFetching ? (
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
                    <>
                        {
                            selectedMembers.length > 0 && (
                                <Button
                                    color="blue"
                                    variant="filled"
                                    onClick={() => handleSendSMS(selectedMembers)}
                                    style={{ marginBottom: 10 }}
                                >
                                    Send SMS to {selectedMembers.length} Members
                                </Button>
                            )
                        }
                        < Box mt={50}>
                            <DataTable
                                data={nonLoggedMembers}
                                columns={columns}
                                pageSize={perPage}
                                activePage={page}
                                totalRecords={totalRecords}
                                onPageChange={setPage}
                                onPageSizeChange={setPerPage}
                                pageSizeOptions={[50, 100, 500, 1000]}
                                defaultPageSize={100}
                            />
                        </Box>
                    </>
                )
            }
        </Paper >

    );
};

export default TodayNonLogged;
