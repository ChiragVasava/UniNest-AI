import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      {children}
    </ProtectedRoute>
  );
}
