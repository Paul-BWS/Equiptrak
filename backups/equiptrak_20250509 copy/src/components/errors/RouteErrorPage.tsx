import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, LogIn } from "lucide-react";

export function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = "An unexpected error occurred";
  let errorDetails = "";
  let isAuthError = false;

  if (isRouteErrorResponse(error)) {
    if (error.status === 401 || error.status === 403) {
      isAuthError = true;
      errorMessage = "You need to be logged in to access this page";
      errorDetails = "Please log in to continue";
    } else {
      errorMessage = error.statusText || error.data?.message || "Page not found";
      errorDetails = `Error ${error.status}`;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || "";
    
    // Check if it's an auth-related error
    if (errorMessage.includes('auth') || errorMessage.includes('login') || errorMessage.includes('session')) {
      isAuthError = true;
      errorMessage = "Authentication error occurred";
      errorDetails = "Please try logging in again";
    }
  }

  const handleLoginClick = () => {
    window.location.href = "/login";
  };

  const handleBackClick = () => {
    try {
      navigate(-1);
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="p-8 max-w-md mx-auto bg-card rounded-lg shadow-lg border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4">Oops! Something went wrong</h2>
        <p className="text-muted-foreground mb-2">{errorMessage}</p>
        {errorDetails && (
          <p className="text-sm text-muted-foreground mb-6">{errorDetails}</p>
        )}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleBackClick}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          {!isAuthError ? (
            <Button
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          ) : (
            <Button
              onClick={handleLoginClick}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 