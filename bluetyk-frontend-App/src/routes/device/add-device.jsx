import { createFileRoute } from '@tanstack/react-router'
import AddDevice from '../../pages/Device/AddDevice.jsx';

export const Route = createFileRoute('/device/add-device')({
  component: AddDevice,
})


