import React from "react";
import { Paper, Title, Group, Divider, Center, Skeleton, Flex, Badge, Tooltip, Avatar } from "@mantine/core";
import { IconUserCog, IconEye, IconListDetails } from "@tabler/icons-react";
import DataTable from '@components/layout/DataTable';
import { useFetchMembers, useDeleteMember } from "../../queries/members";
import { useNavigate } from '@tanstack/react-router';
import { act } from "react";





const ViewMembers = () => {


  const { data: members = [], isLoading, isError, error } = useFetchMembers();
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

      <DataTable
        data={members}
        columns={columns}
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
    </Paper>
  );
};

export default ViewMembers;
