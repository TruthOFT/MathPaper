import { Navigate, useModel } from '@umijs/max';

export default function HomeRedirect() {
  const { initialState } = useModel('@@initialState');
  const roleType = initialState?.currentUser?.roleType || initialState?.currentUser?.access;

  return <Navigate to={roleType === 'student' ? '/tasks' : '/dashboard/analysis'} replace />;
}
