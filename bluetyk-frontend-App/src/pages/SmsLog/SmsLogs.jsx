import { useState } from "react";
import { Paper, TextInput, Group, Select, ScrollArea, Skeleton, Flex, Button, ActionIcon, Box, Tooltip } from "@mantine/core";
import { IconSearch, IconMessage, IconDeviceDesktop, IconMapPin, IconCircleCheck, IconCalendar, IconEye, IconDownload } from "@tabler/icons-react";
import DataTable from '@components/layout/DataTable';
import { useFetchDevices } from "../../queries/device";
import { useFetchDepartments } from "../../queries/department";
import { useNavigate } from '@tanstack/react-router';
import { useFetchSmsLogs, DownloadSmsLogs } from "../../queries/sms";
import { useDisclosure } from "@mantine/hooks";
import SmsLogDetailsViewModal from "../../components/layout/SmsLogViewModal";
import { DateInput } from "@mantine/dates";
import SmsStatsCard from "../../components/layout/SmsStatusCard";
import { useSendSmsLogged } from "../../queries/sms";
import { notify } from "@utils/helpers";
import LoadingComponent from "../../components/layout/loadingComponent";





const SmsLogs = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(100);
    const [filters, setFilters] = useState({
        name: "",
        department: "",
        device: "",
        card_no: "",
        phone_no: "",
        status: "",
        date: "",
    });
    const [selectedRow, setSelectedRow] = useState(null);
    const [opened, { open, close }] = useDisclosure(false);


    const { data, isLoading } = useFetchSmsLogs({ filters, page, perPage });
    const smsLogs = data?.sms_logs?.data || [];
    const totalRecords = data?.sms_logs?.total || 0;
    const totalSms = data?.total_count || 0;
    const successCount = data?.success_count || 0;
    const failureCount = data?.failed_count || 0;
    const totalPunches = data?.total_punches || 0;

    const { data: allDepartmentsResponse = {} } = useFetchDepartments({ page: 1, perPage: 100 });
    const allDepartments = allDepartmentsResponse?.data ?? [];
    const { data: allDeviceResponse = {} } = useFetchDevices({ page: 1, perPage: 100 });
    const allDevice = allDeviceResponse?.data ?? [];




    const navigate = useNavigate();
    const handleViewDetails = (row) => {
        setSelectedRow(row);
        open();
    };

    const sendSmsMutation = useSendSmsLogged();

    const handleSendSMS = () => {
        sendSmsMutation.mutate(undefined, {
            onSuccess: (response) => {
                notify({
                    title: "Success",
                    message: response.message,
                    iconType: "success",
                });
            },
        });
    };



    const columns = [
        { accessor: "sl_no", label: "Sl No" },
        { accessor: "name", label: "Name" },
        { accessor: "department", label: "department" },
        { accessor: "member_to_device.member.card_no", label: "Card No" },
        { accessor: "template_name", label: "Template Name" },
        { accessor: "phone_no", label: "Phone No" },
        { accessor: "timestamp", label: "Time" },
        { accessor: "status", label: "Status" },
        {
            accessor: "actions",
            label: "Actions",
            render: (_, row) => (
                <ActionIcon
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={() => handleViewDetails(row)}
                >
                    <IconEye size={16} />
                </ActionIcon>
            ),
        }
    ];





    return (
        <>
            <LoadingComponent visible={sendSmsMutation.isPending}>
                <SmsStatsCard totalSms={totalSms} successCount={successCount} failureCount={failureCount} totalPunches={totalPunches} />

                <Paper p="xl" withBorder >

                    <Box mb={30} style={{ textAlign: "right" }}>
                        <Group spacing="md" justify="end">
                            <Tooltip label="Download CSV">
                                <ActionIcon
                                    variant="outline"
                                    color="blue"
                                    radius="xl"
                                    size="lg"
                                    onClick={() => DownloadSmsLogs({ filters })}
                                >
                                    <IconDownload size={20} />
                                </ActionIcon>
                            </Tooltip>

                            <Tooltip label="Send SMS">
                                <ActionIcon
                                    variant="outline"
                                    color="blue"
                                    radius="xl"
                                    size="lg"
                                    onClick={handleSendSMS}
                                    disabled={sendSmsMutation.isPending}
                                >
                                    <IconMessage size={20} />
                                </ActionIcon>
                            </Tooltip>

                        </Group>
                    </Box>

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

                            <TextInput
                                placeholder="Search by Card No"
                                value={filters.card_no}
                                onChange={(e) => setFilters({ ...filters, card_no: e.target.value })}
                                leftSection={<IconSearch size={16} />}
                                style={{ minWidth: 200 }}
                            />


                            <TextInput
                                placeholder="Search by Phone No"
                                value={filters.phone_no}
                                onChange={(e) => setFilters({ ...filters, phone_no: e.target.value })}
                                leftSection={<IconSearch size={16} />}
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
                                placeholder="Select Status"
                                data={[
                                    { value: 'success', label: 'Success' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'failure', label: 'Failed' },
                                ]}
                                value={filters.status}
                                onChange={(val) => setFilters({ ...filters, status: val })}
                                clearable
                                leftSection={<IconCircleCheck size={16} />}
                                style={{ minWidth: 200 }}
                            />



                            <Button
                                variant="outline"
                                onClick={() =>
                                    setFilters({
                                        name: "",
                                        location: null,
                                        device: null,
                                        date: null,
                                        department: null,
                                        card_no: "",
                                        phone_no: "",
                                        status: "",
                                    })
                                }
                                style={{ minWidth: 100 }}
                            >
                                Reset
                            </Button>
                        </Group>
                    </ScrollArea>


                    {isLoading ? (
                        <Paper p="xl" mt="md">
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
                    ) : (

                        <DataTable
                            data={smsLogs}
                            columns={columns}
                            pageSize={perPage}
                            activePage={page}
                            totalRecords={totalRecords}
                            onPageChange={setPage}
                            onPageSizeChange={setPerPage}
                            pageSizeOptions={[50, 100, 500, 1000]}
                            defaultPageSize={100}

                        />
                    )}
                </Paper>
                <SmsLogDetailsViewModal
                    opened={opened}
                    onClose={close}
                    row={selectedRow}
                />
            </LoadingComponent>
        </>
    );
};

export default SmsLogs;
