import { createFileRoute } from '@tanstack/react-router'
import MemberDetails from '../../pages/Members/MemberDetails.jsx';

export const Route = createFileRoute('/members/$memberId')({
  component: MemberDetails,
})


