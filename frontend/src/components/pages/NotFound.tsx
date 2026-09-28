import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="app-page-header mx-4 max-w-lg">
        <div className="w-full text-center">
        <h1 className="app-page-title">404</h1>
        <p className="app-page-description mb-4">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
