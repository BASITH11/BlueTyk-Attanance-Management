import { createFileRoute } from '@tanstack/react-router';
import UserLayout from '../../pages/Users/UserLayout.jsx';

export const Route = createFileRoute('/users/user-layout')({
  component: UserLayout,
})



