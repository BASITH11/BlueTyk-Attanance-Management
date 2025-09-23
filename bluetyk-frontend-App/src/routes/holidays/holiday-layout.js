import { createFileRoute } from '@tanstack/react-router'
import HolidayLayout from '../../pages/Holiday/HolidayLayout';

export const Route = createFileRoute('/holidays/holiday-layout')({
  component: HolidayLayout,
})


