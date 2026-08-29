import { Outlet } from 'react-router-dom';
import MainLayout from '../../../../components/dashboard/layout/MainLayout';

export default function ClientSettingsLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
