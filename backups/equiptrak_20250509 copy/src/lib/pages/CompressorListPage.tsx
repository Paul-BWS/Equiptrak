import { useParams } from 'react-router-dom';
import { CompressorList } from '@/components/equipment/lists/CompressorList';

export default function CompressorListPage() {
  const { customerId } = useParams();

  if (!customerId) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Error</h2>
          <p className="text-muted-foreground">Customer ID is required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <CompressorList />
    </div>
  );
} 