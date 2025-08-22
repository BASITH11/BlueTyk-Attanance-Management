import { createFileRoute } from '@tanstack/react-router'
import ViewDevice from '../../pages/Device/ViewDevice.jsx';

export const Route = createFileRoute('/device/view-device')({
  component: ViewDevice,
})


