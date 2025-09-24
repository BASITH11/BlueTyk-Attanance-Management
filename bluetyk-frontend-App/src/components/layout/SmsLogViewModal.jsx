// components/SmsLogDetailsViewModal.jsx
import { Modal, Grid, TextInput, Textarea, Button, Group } from "@mantine/core";

const SmsLogDetailsViewModal = ({ opened, onClose, row }) => {
    if (!row) return null;

    return (
        <Modal opened={opened} onClose={onClose} title="SMS Log Details" size="90%">
            <Grid gutter="sm">
                <Grid.Col span={6}>
                    <TextInput label="Name" value={row.name} readOnly />
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput label="Department" value={row.department} readOnly />
                </Grid.Col>

                <Grid.Col span={6}>
                    <TextInput label="Device Name" value={row.member_to_device?.device?.device_name || ""} readOnly />
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput label="Device Serial No" value={row.member_to_device?.device_serial_no || ""} readOnly />
                </Grid.Col>

                <Grid.Col span={6}>
                    <TextInput label="Card No" value={row?.member_to_device?.member?.card_no || ""} readOnly />
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput label="Phone No" value={row.phone_no} readOnly />
                </Grid.Col>

                <Grid.Col span={6}>
                    <TextInput label="Status" value={row.status} readOnly />
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput label="Template Name" value={row.template_name} readOnly />
                </Grid.Col>

                <Grid.Col span={12}>
                    <Textarea label="Message" value={row.sms_log} minRows={3} readOnly />
                </Grid.Col>
                <Grid.Col span={6}>
                    <Textarea label="Batch Id" value={row.batch_id} minRows={3} readOnly />
                </Grid.Col>
                <Grid.Col span={6}>
                    <Textarea label="Message Id" value={row.message_id} minRows={3} readOnly />
                </Grid.Col>

                <Grid.Col span={12}>
                    <TextInput label="Timestamp" value={row.timestamp} readOnly />
                </Grid.Col>
            </Grid>

            <Group position="right" mt="md">
                <Button onClick={onClose}>Close</Button>
            </Group>
        </Modal>
    );
};

export default SmsLogDetailsViewModal;
