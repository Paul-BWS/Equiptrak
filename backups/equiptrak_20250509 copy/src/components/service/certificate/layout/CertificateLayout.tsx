import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Mail } from 'lucide-react';

export interface CertificateLayoutProps {
  children: ReactNode;
  onBack: () => void;
  onPrint: () => void;
  customerEmail?: string;
  certificateNumber: string;
  customerName: string;
  equipmentName: string;
}

export function CertificateLayout({
  children,
  onBack,
  onPrint,
  customerEmail,
  certificateNumber,
  customerName,
  equipmentName,
}: CertificateLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[210mm] mx-auto">
        <div className="sticky top-0 z-10 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
          <div className="flex items-center justify-between py-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onPrint}
                className="dark:bg-[#a6e15a] dark:text-background dark:hover:bg-[#a6e15a]/90 dark:border-0"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Certificate
              </Button>
              {customerEmail && (
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Certificate
                </Button>
              )}
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}