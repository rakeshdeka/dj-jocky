
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "../../components/dashboard/layout/MainLayout";
import { Button } from "../../components/dashboard/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <p className="text-2xl text-foreground mb-6">Page not found</p>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </MainLayout>
  );
};

export default NotFound;
