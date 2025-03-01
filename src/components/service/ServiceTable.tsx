import { NewServiceRecord } from "@/components/service/modals/NewServiceRecord";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Eye, 
  FileEdit, 
  Printer,
  QrCode,
  Trash2 
} from 'lucide-react';
import { format } from 'date-fns';

interface ServiceTableProps {
  services: any[];
  onView: (service: any) => void;
  onEdit: (service: any) => void;
  onDelete: (service: any) => void;
}

export function ServiceTable({ services, onView, onEdit, onDelete }: ServiceTableProps) {
  const navigate = useNavigate();
  
  const handlePrintCertificate = (serviceId: string) => {
    navigate(`/certificate/${serviceId}`);
  };
  
  const handlePrintQRCode = (serviceId: string) => {
    navigate(`/certificate/${serviceId}/qr`);
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Certificate #</TableHead>
            <TableHead>Test Date</TableHead>
            <TableHead>Retest Date</TableHead>
            <TableHead>Engineer</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No service records found
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.certificate_number}</TableCell>
                <TableCell>{service.test_date ? format(new Date(service.test_date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                <TableCell>{service.retest_date ? format(new Date(service.retest_date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                <TableCell>{service.engineer_name || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(service)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(service)}
                      title="Edit Record"
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePrintCertificate(service.id)}
                      title="Print Certificate"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePrintQRCode(service.id)}
                      title="Print QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(service)}
                      title="Delete Record"
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 