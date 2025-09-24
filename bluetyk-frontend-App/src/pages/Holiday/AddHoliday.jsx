import React from 'react';
import {
    Stack,
    TextInput,
    Paper,
    Button,
    Grid,
    Box,
    Select,
    Switch
} from "@mantine/core";
import { IconClock2, IconCalendar } from '@tabler/icons-react';
import { useAddHoliday } from '../../queries/holiday';
import { useForm } from "@mantine/form";
import { notify } from "@utils/helpers";
import { DateInput } from "@mantine/dates";


const AddHolidays = () => {

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
            name: (value) => (value.length < 1 ? ' Holiday Name is required' : null),
        },
    });



    const addHolidayMutation = useAddHoliday();

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("type", values.type);
        formData.append("holiday_date", values.holidayDate);
        formData.append("is_recurring", values.isRecurring ? 1 : 0);
        formData.append("day_of_week", values.dayOfWeek);
        formData.append("week_of_month", values.weekOfMonth);
        addHolidayMutation.mutate(formData, {
            onSuccess: (data) => {
                notify({
                    title: "Success",
                    message: data.message,
                    iconType: "success",
                });
                form.reset();
            },
        });
    }


    return (
        <Paper p="xl">

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                        <Stack spacing="md">

                            <TextInput

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
export default AddHolidays;