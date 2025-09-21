import React from 'react';
import {
    Stack,
    TextInput,
    Paper,
    Button,
    Grid,
    Box,
    Select,
} from "@mantine/core";
import { IconClock, IconLabel, } from '@tabler/icons-react';
import { useAddShift } from '../../queries/shift';
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notify } from "@utils/helpers";


const AddShift = () => {

    // Form setup
    const form = useForm({
        initialValues: {
            shiftName: '',
            shiftStart: '',
            shiftEnd: '',
            isOverNight: '',
        },
        validate: {
            shiftName: (value) => (value.length < 1 ? 'Shift Name is required' : null),
            shiftStart: (value) => (value.length < 1 ? 'Shift Start is required' : null),
            shiftEnd: (value) => (value.length < 1 ? 'Shift End is required' : null),
            isOverNight: (value) => (value.length < 1 ? 'Shift Type is required' : null),
        }
    });
    const AddShiftMutation = useAddShift();







    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append("shift_name", values.shiftName);
        formData.append("shift_start", values.shiftStart);
        formData.append("shift_end", values.shiftEnd);
        formData.append("is_overnight", values.isOverNight);

        AddShiftMutation.mutate(formData, {
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
export default AddShift;