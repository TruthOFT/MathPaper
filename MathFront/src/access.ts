/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: API.CurrentUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  const roleType = currentUser?.roleType || currentUser?.access;
  return {
    canLogin: Boolean(currentUser),
    canAdmin: roleType === 'admin',
    canTeacher: roleType === 'teacher' || roleType === 'admin',
    canStudent: roleType === 'student',
  };
}
