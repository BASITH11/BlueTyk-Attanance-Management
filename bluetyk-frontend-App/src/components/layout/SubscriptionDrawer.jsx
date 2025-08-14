import { Drawer } from "@mantine/core";

import { useSubscriptionStore } from "../../config/authStore";

export default function SubscriptionDrawer() {
    const { open, closeDrawer } = useSubscriptionStore();

    return (
        <Drawer
            opened={open}
            onClose={closeDrawer}
            title="Subscription Required"
            padding="md"
            size="md"
        >
            <p>Your subscription has expired or is not active. Please renew to continue using the app.</p>
            {/* QR code or payment options go here */}
        </Drawer>
    );
}
