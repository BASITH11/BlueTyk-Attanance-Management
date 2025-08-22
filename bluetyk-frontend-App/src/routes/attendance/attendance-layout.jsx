import { createFileRoute } from '@tanstack/react-router'
import AttendanceLayout from '../../pages/Attendance/AttendanceLayout.jsx';

export const Route = createFileRoute('/attendance/attendance-layout')({
  component: AttendanceLayout,
})


