import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import SidebarWrapper from '@/components/navigation/sidebar-wrapper';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <SidebarWrapper session={session}>
      {children}
    </SidebarWrapper>
  );
}
