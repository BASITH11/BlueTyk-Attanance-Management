import { createFileRoute } from '@tanstack/react-router'
import UpdateMember from '../../../pages/Members/UpdateMember.jsx';


export const Route = createFileRoute('/members/memberEdit/$memberId')({
  component: UpdateMember,
})
