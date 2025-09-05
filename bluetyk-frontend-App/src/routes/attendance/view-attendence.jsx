import { createFileRoute } from '@tanstack/react-router';
import AttendanceLayout from '../../pages/Attendance/AttendanceLayout';
export const Route = createFileRoute('/attendance/view-attendence')({
  component: AttendanceLayout,
})

