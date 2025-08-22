import { createFileRoute } from '@tanstack/react-router'
import AddMembers from '../../pages/Members/AddMembers.jsx';

export const Route = createFileRoute('/members/add-members')({
  component: AddMembers,
})


