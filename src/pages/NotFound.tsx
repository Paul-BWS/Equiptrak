import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => navigate(-1)} 
            className="w-full"
            variant="outline"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate("/")} 
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
} 