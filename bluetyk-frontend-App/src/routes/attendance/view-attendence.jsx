import { createFileRoute } from '@tanstack/react-router';
import ViewAttendance from '../../pages/Attendance/ViewAttendance.jsx';

export const Route = createFileRoute('/attendance/view-attendence')({
  component: ViewAttendance,
})

