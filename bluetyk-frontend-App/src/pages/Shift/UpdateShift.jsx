import { React, useEffect } from 'react';
import {
    Stack,
    TextInput,
    Paper,
    Button,
    Grid,
    Box,
    Select,
    Skeleton,
    MultiSelect,
} from "@mantine/core";
import { IconLabel, IconClock } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { useUpdateShift, useFetchShiftById } from '../../queries/shift';
import { TimeInput } from "@mantine/dates";
import { notify } from "@utils/helpers";
import { useSearch } from '@tanstack/react-router';
import { useFetchHolidays } from '../../queries/holiday';


const UpdateShift = () => {


    const search = useSearch({ from: '/shift/shift-layout' });
    const shiftId = search?.shiftId || null;
    const { data, isLoading } = useFetchShiftById(shiftId);
    const { data: holidays } = useFetchHolidays({ page: 1, perPage: 1000 });



    // Form setup
    const form = useForm({
        initialValues: {
            shiftName: '',
            shiftStart: '',
            shiftEnd: '',
            isOverNight: '',
            holidayIds: [],
        },
        validate: {
            shiftName: (value) => (value.length < 1 ? 'Shift Name is required' : null),
            shiftStart: (value) => (value.length < 1 ? 'Shift Start is required' : null),
            shiftEnd: (value) => (value.length < 1 ? 'Shift End is required' : null),
            isOverNight: (value) => (value.length < 1 ? 'Shift Type is required' : null),

        }
    });

    useEffect(() => {
        if (data?.id) {
            form.setValues({
                shiftName: data.shift_name || "",
                shiftStart: data.shift_start || "",
                shiftEnd: data.shift_end || "",
                isOverNight: data.is_overnight ? "1" : "0",
                holidayIds: data.shift_to_holidays
                    ? data.shift_to_holidays.map(h => String(h.holiday_id))
                    : [],
            });
        }
    }, [data]);


    const UpdateShiftMutation = useUpdateShift();

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("id", shiftId);
        formData.append("shift_name", values.shiftName);
        formData.append("shift_start", values.shiftStart.slice(0, 5));
        formData.append("shift_end", values.shiftEnd.slice(0, 5))
        formData.append("is_overnight", values.isOverNight);
        values.holidayIds.forEach((id, index) => {
            formData.append(`holiday_ids[${index}]`, id);
        });

        UpdateShiftMutation.mutate(formData, {
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
                                Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton key={index} height={30} width="100%" />
                                ))
                            ) : (
                                <>
                                    <TextInput

                                        label="Shift Name"
                                        withAsterisk
                                        leftSectionPointerEvents="none"
                                        leftSection={<IconLabel size={18} />}
                                        {...form.getInputProps("shiftName")}

                                    />

                                    <TimeInput
                                        label="Shift Start"
                                        withAsterisk
                                        leftSectionPointerEvents="none"
                                        leftSection={<IconClock size={18} />}
                                        {...form.getInputProps("shiftStart")}

                                    />

                                    <TimeInput
                                        label="Shift End"
                                        withAsterisk
                                        leftSectionPointerEvents="none"
                                        leftSection={<IconClock size={18} />}
                                        {...form.getInputProps("shiftEnd")}

                                    />


                                    <Select
                                        label="Shift Type"
                                        withAsterisk
                                        leftSectionPointerEvents="none"
                                        placeholder="Select Shift Type"
                                        {...form.getInputProps("isOverNight")}
                                        data={[
                                            { value: "1", label: "Over Night" },
                                            { value: "0", label: "Day" },
                                        ]}
                                    />


                                    <MultiSelect
                                        label="Assign Holidays"
                                        placeholder="Select holidays"
                                        searchable
                                        clearable
                                        data={(holidays?.data || []).map(h => ({
                                            value: String(h.id),
                                            label: h.name,
                                        }))}
                                        {...form.getInputProps("holidayIds")}
                                    />


                                    <Box mt="sm" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button type="submit">Update</Button>
                                    </Box>
                                </>
                            )}


                        </Stack>
                    </Grid.Col>


                </Grid>
            </form>
        </Paper>

    );
}
export default UpdateShift;