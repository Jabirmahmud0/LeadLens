import { AdminToaster } from '@/components/admin/AdminToast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AdminToaster />
    </>
  );
}
