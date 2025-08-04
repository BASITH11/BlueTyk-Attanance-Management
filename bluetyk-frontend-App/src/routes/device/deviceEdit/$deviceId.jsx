import { createFileRoute } from '@tanstack/react-router'
import UpdateDevice from '../../../pages/Device/UpdateDevice.jsx';


export const Route = createFileRoute('/device/deviceEdit/$deviceId')({
  component: UpdateDevice,
})

