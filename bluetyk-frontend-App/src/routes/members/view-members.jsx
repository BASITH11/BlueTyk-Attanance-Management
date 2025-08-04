import { createFileRoute } from '@tanstack/react-router'
import ViewMembers from '../../pages/Members/ViewMembers.jsx';
export const Route = createFileRoute('/members/view-members')({
  component: ViewMembers,
})

