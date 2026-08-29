import { Outlet } from 'react-router-dom';
import MainLayout from '../../../../components/dashboard/layout/MainLayout';

export default function AdminSettingsLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
