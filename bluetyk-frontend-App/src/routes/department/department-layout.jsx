import { createFileRoute } from '@tanstack/react-router'
import DepartmentLayout from '../../pages/Department/DepartmentLayout.jsx';

export const Route = createFileRoute('/department/department-layout')({
  component: DepartmentLayout,
})


