import React from 'react';
import {
    Stack,
    TextInput,
    Paper,
    Button,
    Grid,
    Box,
} from "@mantine/core";
import { IconClock2, IconPin } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { notify } from "@utils/helpers";

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
            type: (value) => (value.length < 1 ? ' Holiday Type is required' : null),
            holidayDate: (value) => (value.length < 1 ? ' Holiday Date is required' : null),
            isRecurring: (value) => (value.length < 1 ? ' Is Recurring is required' : null),
            dayOfWeek: (value) => (value.length < 1 ? ' Day of the week is required' : null),
            weekOfMonth: (value) => (value.length < 1 ? ' Week of the month is required' : null),
        },
    });



    const addLocationMutation = useAddLocation();

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("type", values.type);
        formData.append("holiday_date", values.holidayDate);
        formData.append("is_recurring", values.isRecurring);
        formData.append("day_of_week", values.dayOfWeek);
        formData.append("week_of_month", values.weekOfMonth);
        addLocationMutation.mutate(formData, {
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
                                        {...form.getInputProps("day_of_week")}
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
                                        {...form.getInputProps("week_of_month")}
                                    />
                                </>
                            )}

                            <Switch
                                label="Recurring Holiday"
                                thumbIcon={<IconRepeat size={14} />}
                                {...form.getInputProps("is_recurring", { type: "checkbox" })}
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