import React from "react";
import { Paper, FileInput, Box, Button } from "@mantine/core";
import { IconFileUpload } from "@tabler/icons-react";
import { useAddBulkMember } from "../../queries/members";
import { notify } from "@utils/helpers";
import { useForm } from "@mantine/form";


const BulkAddMember = () => {


    const form = useForm({
        initialValues: {
            file: null,
        },
        validate: {
            file: (value) => (value ? null : 'Please upload a CSV file'),
        },
    });

    const addBulkMemberMutation = useAddBulkMember();
    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append('file', values.file);

        addBulkMemberMutation.mutate(formData, {
            onSuccess: (data) => {

                notify({
                    title: "Success",
                    message: data.message,
                    iconType: "success",
                });
                form.reset();

            },
        });


    };



    return (
        <Paper p="xl">

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Box mb="md" w={400} >
                    <FileInput
                        rightSection={<IconFileUpload />}
                        label="Students CSV File"
                        placeholder="Upload CSV file"
                        {...form.getInputProps('file')}
                        rightSectionPointerEvents="none"
                        mt="md"
                        accept=".csv,.xlsx,.xls"
                    />
                    <Box mt="sm" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit">Submit</Button>
                    </Box>
                </Box>
            </form>

        </Paper>
    );
};

export default BulkAddMember;
