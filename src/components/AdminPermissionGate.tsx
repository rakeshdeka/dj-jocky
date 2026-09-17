import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PuffLoader } from 'react-spinners';
import { RootState } from '../store/store';
import { loadAdminAccess } from '../redux/adminAccessSlice';
import {
  canAccessAdminPath,
  getDefaultAdminLandingPath,
} from '../lib/admin-access-api';
import { Button } from './dashboard/ui/button';
import { Link } from 'react-router-dom';

type AdminPermissionGateProps = {
  children: React.ReactNode;
};

export default function AdminPermissionGate({ children }: AdminPermissionGateProps) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { isLoaded, isLoading, menu, isSuperAdmin, error } = useSelector(
    (state: RootState) => state.adminAccess,
  );

  useEffect(() => {
    if (!token || user?.role !== 'admin') return;
    if (!isLoaded && !isLoading) {
      dispatch(loadAdminAccess(token) as never);
    }
  }, [dispatch, token, user?.role, isLoaded, isLoading]);

  if (user?.role !== 'admin') {
    return <>{children}</>;
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <PuffLoader color="#C4FE01" />
      </div>
    );
  }

  if (error && !menu && !isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => dispatch(loadAdminAccess(token!) as never)}>
          Retry
        </Button>
      </div>
    );
  }

  const pathname = location.pathname;

  if (pathname.startsWith('/admin/sub-admins') && !isSuperAdmin) {
    return <Navigate to={getDefaultAdminLandingPath(menu, isSuperAdmin)} replace />;
  }

  if (!canAccessAdminPath(pathname, menu, isSuperAdmin)) {
    const fallback = getDefaultAdminLandingPath(menu, isSuperAdmin);
    if (pathname !== fallback) {
      return <Navigate to={fallback} replace />;
    }

    return (
      <div className="max-w-lg mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="text-lg font-bold">Access denied</h2>
        <p className="text-sm text-muted-foreground">
          Your sub-admin account does not have permission for this section. Contact a super admin
          to update your access.
        </p>
        <Button asChild variant="outline">
          <Link to="/admin/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
