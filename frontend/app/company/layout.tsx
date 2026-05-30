import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['COMPANY']}>
      {children}
    </ProtectedRoute>
  );
}
