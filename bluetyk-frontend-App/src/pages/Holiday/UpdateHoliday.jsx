import React, { useEffect } from 'react';
import {
    Stack,
    TextInput,
    Paper,
    Button,
    Grid,
    Box,
    Skeleton,
    Select,
    Switch
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconClock2, IconCalendar } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { useFetchHolidayById, useUpdateHoliday } from "../../queries/holiday";
import { notify } from "@utils/helpers";
import { useSearch } from '@tanstack/react-router';


const UpdateHoliday = () => {

    const search = useSearch({ from: '/holidays/holiday-layout' });
    const holidayId = search?.holidayId || null;
    const { data, isLoading } = useFetchHolidayById(holidayId);
    console.log(data);

    // Form setup
    const form = useForm({
        initialValues: {
            name: '',
            type: '',
            holidayDate: '',
            isRecurring: false,
            dayOfWeek: '',
            weekOfMonth: '',

        },
        validate: {
            name: (value) => (value.length < 1 ? 'location is required' : null),

        }
    });

    useEffect(() => {
        if (data?.holiday) {
            form.setValues({
                name: data.holiday.name || "",
                type: data.holiday.type || "",
                holidayDate: data.holiday.holiday_date ? new Date(data.holiday.holiday_date) : null,
                isRecurring: data.holiday.is_recurring === 1,
                dayOfWeek: data.holiday.day_of_week?.toString() || "",
                weekOfMonth: data.holiday.week_of_month?.toString() || "",
            });
        }
    }, [data]);


    const UpdateHolidayMutation = useUpdateHoliday();
    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("id", holidayId);
        formData.append("name", values.name);
        formData.append("type", values.type);
        formData.append("holiday_date", values.holidayDate ? values.holidayDate.toISOString().split('T')[0] : '');
        formData.append("is_recurring", values.isRecurring ? 1 : 0);
        formData.append("day_of_week", values.dayOfWeek);
        formData.append("week_of_month", values.weekOfMonth);

        UpdateHolidayMutation.mutate(formData, {
            onSuccess: (data) => {
                notify({
                    title: "Success",
                    message: data.message,
                    iconType: "success",
                });
            }
        });
    }


    return (
        <Paper p="xl">

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                        <Stack spacing="md">
                            {isLoading ? (
                                <>
                                    <Skeleton height={40} radius="md" />
                                </>
                            ) : (
                                <>                                <TextInput

                                    label="Holiday Name"
                                    withAsterisk
                                    leftSectionPointerEvents="none"
                                    leftSection={<IconClock2 size={18} />}
                                    {...form.getInputProps("name")}

                                />

                                    <Select
                                        label="Holiday Type"
                                        withAsterisk
                                        data={[
                                            { value: "date", label: "Specific Date" },
                                            { value: "day", label: "Day of Week" },
                                        ]}
                                        {...form.getInputProps("type")}
                                    />

                                    {form.values.type === "date" && (
                                        <DateInput
                                            label="Holiday Date"
                                            withAsterisk
                                            leftSection={<IconCalendar size={18} />}
                                            {...form.getInputProps("holidayDate")}
                                        />
                                    )}

                                    {form.values.type === "day" && (
                                        <>
                                            <Select
                                                label="Day of Week"
                                                withAsterisk
                                                data={[
                                                    { value: "0", label: "Sunday" },
                                                    { value: "1", label: "Monday" },
                                                    { value: "2", label: "Tuesday" },
                                                    { value: "3", label: "Wednesday" },
                                                    { value: "4", label: "Thursday" },
                                                    { value: "5", label: "Friday" },
                                                    { value: "6", label: "Saturday" },
                                                ]}
                                                {...form.getInputProps("dayOfWeek")}
                                            />

                                            <Select
                                                label="Week of Month"
                                                withAsterisk
                                                data={[
                                                    { value: "1", label: "1st Week" },
                                                    { value: "2", label: "2nd Week" },
                                                    { value: "3", label: "3rd Week" },
                                                    { value: "4", label: "4th Week" },
                                                    { value: "5", label: "5th Week" },
                                                ]}
                                                {...form.getInputProps("weekOfMonth")}
                                            />
                                        </>
                                    )}

                                    <Switch
                                        label="Recurring Holiday"
                                        {...form.getInputProps("isRecurring", { type: "checkbox" })}
                                    />
                                </>


                            )}

                            <Box mt="sm" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="submit">Submit</Button>
                            </Box>

                        </Stack>
                    </Grid.Col>


                </Grid>
            </form>
        </Paper>

    );
}
export default UpdateHoliday;