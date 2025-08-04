import React from "react";
import { Paper, Title, Group, Divider, Center, Skeleton, Flex, Badge } from "@mantine/core";
import { IconUserCog, IconEye } from "@tabler/icons-react";
import DataTable from '@components/layout/DataTable';
import { useFetchMembers, useDeleteMember } from "../../queries/members";
import { useNavigate } from '@tanstack/react-router';





const ViewMembers = () => {


  const { data: members = [], isLoading, isError, error } = useFetchMembers();
  const { mutate: deleteMutate } = useDeleteMember();
  const navigate = useNavigate();


  const columns = [
    { accessor: "name", label: "Name" },
    { accessor: "phone_no", label: "Phone Number" },
    { accessor: "card_no", label: "Card Number" },
    {
      accessor: "status",
      label: "Status",
      render: () => (
        <Badge color="green" variant="light">
          Active
        </Badge>
      ),
    },
  ];


  if (isLoading) {
    return (
      <Paper p="xl">
        <Group gap="sm" mb="sm" align="center">
          <IconUserCog size={28} />
          <Title order={2}>View Members</Title>
        </Group>
        <Divider my="md" />

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
     navigate({ to: `/members/memberEdit/${row.id}` });
  };

  const handleDelete = (row) => {
    deleteMutate(row.id)
  };

  const handleBulkDelete = (ids) => {
    alert("Deleting: " + ids.join(", "));
  };

  const handleView = (row) => {
    navigate({ to: `/members/${row.id}` });
  };

  return (
    <Paper p="xl">
      <Group gap="sm" mb="sm" align="center">
        <IconUserCog size={28} />
        <Title order={2}>View Members</Title>
      </Group>

      <Divider my="md" />

      <DataTable
        data={members}
        columns={columns}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        defaultPageSize={5}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        actionOptions={[
          {
            label: "View",
            icon: <IconEye size={16} />,
            onClick: handleView,
          },
        ]}
      />
    </Paper>
  );
};

export default ViewMembers;
