import { createFileRoute } from '@tanstack/react-router'
import DeviceDetail from '../../pages/Device/DeviceDetail.jsx';

export const Route = createFileRoute('/device/$deviceId')({
  component: DeviceDetail,
})


