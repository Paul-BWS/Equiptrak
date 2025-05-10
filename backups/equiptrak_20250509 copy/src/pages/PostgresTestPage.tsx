import { useState, useEffect } from 'react';
import PostgresTest from '../components/PostgresTest';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading PostgreSQL Test</h2>
        <p className="text-red-600 mb-4">{error.message}</p>
        <div className="flex gap-4">
          <Button onClick={resetErrorBoundary} variant="outline">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = "/"}>
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PostgresTestPage() {
  const [key, setKey] = useState(0);

  // Function to reset the error boundary
  const handleReset = () => {
    setKey(prevKey => prevKey + 1);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">PostgreSQL Test Page</h1>
      <ErrorBoundary 
        FallbackComponent={ErrorFallback} 
        onReset={handleReset}
        key={key}
      >
        <PostgresTest />
      </ErrorBoundary>
    </div>
  );
} 