import { useState } from "react";
import { Paper, TextInput, Group, Select, ScrollArea, Skeleton, Flex, Badge, Tooltip, Avatar, Button } from "@mantine/core";
import { IconSearch, IconEye, IconListDetails, IconMapPin, IconCircleCheck } from "@tabler/icons-react";
import DataTable from '@components/layout/DataTable';
import { useFetchMembers, useDeleteMember } from "../../queries/members";
import { useFetchDevicesAttributes, useFetchDevices } from "../../queries/device";
import { useFetchDepartments } from "../../queries/department";
import { useNavigate } from '@tanstack/react-router';
import { act } from "react";





const ViewMembers = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [filters, setFilters] = useState({
    name: "",
    department: "",
    device: "",
    card_no: "",
    phone_no: "",
    status: "",
  });


  const { data, isLoading } = useFetchMembers({ filters, page, perPage });
  const members = data?.data || [];
  const totalRecords = data?.total || 0;
  const { data: allDepartmentsResponse = {} } = useFetchDepartments({ page: 1, perPage: 100 });
  const allDepartments = allDepartmentsResponse?.data ?? [];
  const { data: allDeviceResponse = {} } = useFetchDevices({ page: 1, perPage: 100 });
  const allDevice = allDeviceResponse?.data ?? [];

  const { mutate: deleteMutate } = useDeleteMember();
  const navigate = useNavigate();

  const colors = [
    "cyan",
    "violet",
    "pink",
  ];


  const columns = [
    { accessor: "name", label: "Name" },
    {
      accessor: "department",
      label: "Class",
      render: (_, row) => row.department?.department_name || "—"
    },
    { accessor: "phone_no", label: "Phone Number" },
    { accessor: "card_no", label: "Card Number" },
    {
      accessor: "status",
      label: "Status",
      render: (status) => (
        <Badge color={status === 'success' ? "green" : "yellow"} variant="light">
          {status === 'success' ? "Success" : "Pending"}
        </Badge>
      ),
    },
    {
      accessor: "device",
      label: "Devices",
      render: (_, row) => (
        <Group spacing="xs">
          <Avatar.Group>
            {row.member_to_device?.map((mtd, index) => {
              const deviceName = mtd.device?.device_name || "Unknown";
              const color = colors[index % colors.length]; // cycle colors
              return (
                <Tooltip key={index} label={deviceName}>
                  <Avatar radius="xl" size="md" color={color}>
                    {deviceName.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              );
            })}
          </Avatar.Group>
        </Group>
      ),
    },
    { accessor: "source", label: "Source" },
  ];






  const handleEdit = (row) => {
    navigate({
      to: '/members/member-layout',
      search: { tab: 'edit', memberId: row.id }
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
      to: '/members/member-layout',
      search: { tab: 'detail', memberId: row.id }
    });
  };

  const handleLog = (row) => {
    navigate({
      to: '/members/member-layout',
      search: { tab: 'logs', memberId: row.id }
    });
  };


  return (
    <Paper p="xl">

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
          data={members}
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
            {
              label: "Logs",
              icon: <IconListDetails size={16} />,
              onClick: handleLog,
            },
          ]}
        />
      )}
    </Paper>
  );
};

export default ViewMembers;
