import { useState } from "react";
import { Paper, Skeleton, Flex } from "@mantine/core";
import DataTable from '@components/layout/DataTable';
import { useFetchHolidays, useDeleteHoliday } from "../../queries/holiday";
import { useNavigate } from '@tanstack/react-router';





const ViewHolidays = () => {

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(100);

    const { data, isLoading, isError, error } = useFetchHolidays({ page, perPage });
    const holidays = data?.data || [];
    const totalRecords = data?.total || 0;
    const { mutate: deleteMutate } = useDeleteHoliday();
    const navigate = useNavigate();

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekNames = ["1st Week", "2nd Week", "3rd Week", "4th Week", "5th Week"];

    const formattedHolidays = holidays.map((holiday) => ({
        ...holiday,
        is_recurring: holiday.is_recurring ? "Yes" : "No",
        day_of_week: holiday.day_of_week !== null ? dayNames[parseInt(holiday.day_of_week)] : "-",
        week_of_month:
            holiday.week_of_month !== null ? weekNames[parseInt(holiday.week_of_month) - 1] : "-",
        holiday_date: holiday.holiday_date ? new Date(holiday.holiday_date).toLocaleDateString() : "-",
    }));



    const columns = [
        { accessor: "name", label: "Holiday Name" },
        { accessor: "type", label: "Holiday Type" },
        { accessor: "holiday_date", label: "Holiday date" },
        { accessor: "is_recurring", label: "ReOccures" },
        { accessor: "day_of_week", label: "Day Of Week" },
        { accessor: "week_of_month", label: "Week Of Month" },
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
            to: '/holidays/holiday-layout',
            search: { tab: 'edit', holidayId: row.id }
        });
    };

    const handleDelete = (row) => {
        deleteMutate(row.id)
    };

    const handleBulkDelete = (ids) => {
        alert("Deleting: " + ids.join(", "));
    };



    return (
        <Paper p="xl">


            <DataTable
                data={formattedHolidays}
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

            />
        </Paper>
    );
};

export default ViewHolidays;
