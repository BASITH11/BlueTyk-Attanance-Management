import { createFileRoute } from '@tanstack/react-router'
import ViewTodaysAttendance from '../../pages/Attendance/TodaysAttendance.jsx';

export const Route = createFileRoute('/attendance/todays-attendance')({
  component: ViewTodaysAttendance,
})

