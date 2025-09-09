import React, { useState } from "react";
import {
  Table,
  ActionIcon,
  Menu,
  TextInput,
  Select,
  Pagination,
  Group,
  Text,
  Modal,
  Button,
  TableScrollContainer,
} from "@mantine/core";
import {
  IconTrash,
  IconPencil,
  IconDotsVertical,
  IconAdjustmentsHorizontal,
  IconX,
} from "@tabler/icons-react";

const DataTable = ({
  data = [],
  columns = [],
  pageSizeOptions = [5, 10, 15, 20],
  pageSize,
  activePage,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onBulkDelete,
  actionOptions = [],
}) => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };

  const lowerSearch = search.trim().toLowerCase();

  // Filter data by search if any (client-side)
  const filteredData = search
    ? data.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(lowerSearch)
        )
      )
    : data;

  const isSelected = (id) => selectedIds.includes(id);
  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      isSelected(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleBulkDelete = () => {
    onBulkDelete?.(selectedIds);
    setSelectedIds([]);
  };

  const showActions = onEdit || onDelete || actionOptions.length > 0;
  const showCheckboxes = !!onBulkDelete;

  // Total pages for server-side pagination
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <>
      <Modal
        opened={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Confirm Deletion"
        centered
      >
        <Text>Are you sure you want to delete this record?</Text>
        <Group mt="md" justify="flex-end">
          <Button variant="default" onClick={() => setConfirmDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              if (rowToDelete) onDelete?.(rowToDelete);
              setConfirmDeleteOpen(false);
              setRowToDelete(null);
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>

      {/* Top Controls */}
      <Group justify="space-between" mb="md">
        <Select
          label="Rows per page"
          data={pageSizeOptions.map((n) => ({ value: `${n}`, label: `${n}` }))}
          value={pageSize.toString()}
          onChange={(val) => {
            onPageSizeChange?.(Number(val));
            onPageChange?.(1); // reset to page 1
          }}
          maw={100}
        />
        <TextInput
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          rightSection={
            search && (
              <ActionIcon size="sm" onClick={() => setSearch("")} variant="transparent">
                <IconX size={16} />
              </ActionIcon>
            )
          }
        />
      </Group>

      {selectedIds.length > 0 && showCheckboxes && (
        <Text size="sm" color="red" mb="xs">
          {selectedIds.length} selected
        </Text>
      )}

      {/* Table */}
      <TableScrollContainer>
        <Table withRowBorders highlightOnHover style={{ borderRadius: "10px" }}>
          <Table.Thead>
            <Table.Tr>
              {showCheckboxes && (
                <Table.Th style={{ textAlign: "center" }}>
                  <Menu shadow="md" width={180}>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="white">
                        <IconAdjustmentsHorizontal size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconTrash size={16} />}
                        color="red"
                        onClick={handleBulkDelete}
                        disabled={selectedIds.length === 0}
                      >
                        Delete Selected
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Th>
              )}
              {columns.map((col) => (
                <Table.Th key={col.accessor} style={{ textAlign: "center" }}>
                  {col.label}
                </Table.Th>
              ))}
              {showActions && <Table.Th align="right">Actions</Table.Th>}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <Table.Tr key={row.id}>
                  {showCheckboxes && (
                    <Table.Td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isSelected(row.id)}
                        onChange={() => toggleSelect(row.id)}
                      />
                    </Table.Td>
                  )}
                  {columns.map((col) => (
                    <Table.Td key={col.accessor} style={{ textAlign: "center" }}>
                      {col.render
                        ? col.render(getNestedValue(row, col.accessor), row)
                        : getNestedValue(row, col.accessor)}
                    </Table.Td>
                  ))}
                  {showActions && (
                    <Table.Td style={{ textAlign: "center" }}>
                      <Menu shadow="md" width={180}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={18} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          {onEdit && (
                            <Menu.Item
                              leftSection={<IconPencil size={16} />}
                              onClick={() => onEdit(row)}
                            >
                              Edit
                            </Menu.Item>
                          )}
                          {onDelete && (
                            <Menu.Item
                              leftSection={<IconTrash size={16} />}
                              color="red"
                              onClick={() => {
                                setRowToDelete(row);
                                setConfirmDeleteOpen(true);
                              }}
                            >
                              Delete
                            </Menu.Item>
                          )}
                          {actionOptions.map((action, idx) => (
                            <Menu.Item key={idx} leftSection={action.icon} onClick={() => action.onClick(row)}>
                              {action.label}
                            </Menu.Item>
                          ))}
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td
                  colSpan={columns.length + (showActions ? 1 : 0) + (showCheckboxes ? 1 : 0)}
                  align="center"
                >
                  No data found.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </TableScrollContainer>

      {/* Pagination */}
      {totalRecords > pageSize && (
        <Group justify="space-between" mt="md" align="center">
          <Text size="sm" color="dimmed">
            Showing {(activePage - 1) * pageSize + 1} to{" "}
            {Math.min(activePage * pageSize, totalRecords)} of {totalRecords} records
          </Text>
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={onPageChange}
            siblings={1}
            boundaries={1}
          />
        </Group>
      )}
    </>
  );
};

export default DataTable;
