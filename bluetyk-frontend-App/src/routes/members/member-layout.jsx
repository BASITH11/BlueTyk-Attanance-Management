import { createFileRoute } from '@tanstack/react-router';
import MemberLayout from '../../pages/Members/MemberLayout.jsx';

export const Route = createFileRoute('/members/member-layout')({
  component: MemberLayout,
})

