import type { ReactNode } from 'react';
import AdminHead from './head';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminHead />
      {children}
    </>
  );
}
