import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CertificateHeader } from '@/components/service/certificate/CertificateHeader';
import { CertificateCustomerInfo } from '@/components/service/certificate/CertificateCustomerInfo';
import { CertificateFooter } from '@/components/service/certificate/CertificateFooter';
import { PrintControls } from '@/components/service/certificate/layout/PrintControls';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { LolerServiceRecord } from '@/types/loler';
import { format } from 'date-fns';

interface ServiceRecord {
  id: string;
  certificate_number: string;
  inspection_date: string;
  retest_date: string;
  capacity_kg: number;
  safe_to_operate: 'Yes' | 'No' | 'Remedial';
  engineers?: {
    name: string;
  } | null;
  equipment?: {
    name: string;
    serial_number: string;
    profiles?: {
      company_name: string | null;
      email: string | null;
      address: string | null;
      city: string | null;
      postcode: string | null;
    } | null;
  } | null;
  platform_condition_result: 'PASS' | 'REMEDIAL' | 'FAIL';
  control_box_result: 'PASS' | 'REMEDIAL' | 'FAIL';
  hydraulic_system_result: 'PASS' | 'REMEDIAL' | 'FAIL';
  main_structure_result: 'PASS' | 'REMEDIAL' | 'FAIL';
  oil_levels_result: 'PASS' | 'REMEDIAL' | 'FAIL';
  rollers_guides_result: 'PASS' | 'REMEDIAL' | 'FAIL';
  safety_mechanism_result: 'PASS' | 'REMEDIAL' | 'FAIL';
  scissor_operation_result: 'PASS' | 'REMEDIAL' | 'FAIL';
  securing_bolts_result: 'PASS' | 'REMEDIAL' | 'FAIL';
  toe_guards_result: 'PASS' | 'REMEDIAL' | 'FAIL';
  lubrication_result: 'PASS' | 'REMEDIAL' | 'FAIL';
  platform_condition_notes?: string;
  control_box_notes?: string;
  hydraulic_system_notes?: string;
  main_structure_notes?: string;
  oil_levels_notes?: string;
  rollers_guides_notes?: string;
  safety_mechanism_notes?: string;
  scissor_operation_notes?: string;
  securing_bolts_notes?: string;
  toe_guards_notes?: string;
  lubrication_notes?: string;
  observations?: string;
  qualifications: string;
  notes?: string | null;
}

export default function LolerCertificatePage() {
  const { serviceId, customerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: serviceRecord, isLoading } = useQuery<ServiceRecord>({
    queryKey: ['lolerServiceRecord', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loler_service_records')
        .select(`
          *,
          engineers (
            name
          ),
          equipment (
            name,
            serial_number,
            customer_id,
            profiles (
              company_name,
              email,
              address,
              city,
              postcode
            )
          )
        `)
        .eq('id', serviceId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching service record:', error);
        toast({
          title: 'Error',
          description: 'Failed to load certificate',
          variant: 'destructive',
        });
        throw error;
      }

      return data;
    },
  });

  // Update document title when certificate number is available
  useEffect(() => {
    if (serviceRecord?.certificate_number) {
      document.title = `Certificate ${serviceRecord.certificate_number}`;
    }
    return () => {
      document.title = 'EquipTrak';
    };
  }, [serviceRecord?.certificate_number]);

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/equipment/loler`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div>Loading certificate...</div>;
  }

  if (!serviceRecord) {
    return <div>Certificate not found</div>;
  }

  const resultColors = {
    PASS: "text-green-600 border-green-600",
    REMEDIAL: "text-yellow-600 border-yellow-600",
    FAIL: "text-destructive border-destructive",
  };

  return (
    <div className="min-h-screen print:min-h-0 print:h-auto print:bg-white bg-background">
      <PrintControls 
        onBack={handleBack}
        onPrint={handlePrint}
        customerEmail={serviceRecord.equipment?.profiles?.email || undefined}
        certificateNumber={serviceRecord.certificate_number}
        customerName={serviceRecord.equipment?.profiles?.company_name || ''}
        equipmentName={serviceRecord.equipment?.name || ''}
        className="print:hidden sticky top-0 z-10 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      />
      
      {/* First Page */}
      <div className="print:relative print:m-0 print:p-0 print:w-[210mm] print:h-[297mm] print:overflow-hidden mb-8">
        <div className="w-[210mm] h-[297mm] bg-white text-black p-[12mm] print:p-[12mm] mx-auto">
          <CertificateHeader 
            certificateNumber={serviceRecord.certificate_number} 
            title="Report Of Thorough LOLER Examination"
          />

          <div className="grid grid-cols-2 gap-12 mb-12">
            <CertificateCustomerInfo
              companyName={serviceRecord.equipment?.profiles?.company_name || undefined}
              address={serviceRecord.equipment?.profiles?.address || undefined}
              city={serviceRecord.equipment?.profiles?.city || undefined}
              postcode={serviceRecord.equipment?.profiles?.postcode || undefined}
            />
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-blue-600">Service Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Test Date</p>
                  <p className="mt-1">{format(new Date(serviceRecord.inspection_date), "dd MMM yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Retest Date</p>
                  <p className="mt-1">{format(new Date(serviceRecord.retest_date), "dd MMM yyyy")}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engineer</p>
                <p className="mt-1">{serviceRecord.engineers?.name || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Equipment</p>
                  <p className="mt-1">{serviceRecord.equipment?.name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                  <p className="mt-1">{serviceRecord.equipment?.serial_number || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-blue-600 border-b pb-2">Equipment Information</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                  <p className="mt-1">{serviceRecord.capacity_kg} kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Safe to Operate</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1",
                      serviceRecord.safe_to_operate === "Yes"
                        ? resultColors.PASS
                        : serviceRecord.safe_to_operate === "No"
                        ? resultColors.FAIL
                        : resultColors.REMEDIAL
                    )}
                  >
                    {serviceRecord.safe_to_operate}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-blue-600 border-b pb-2">Inspection Results</h2>
              <div className="flex flex-col space-y-4 mt-4 print:space-y-4">
                {Object.entries(serviceRecord)
                  .filter(([key]) => key.endsWith("_result"))
                  .slice(0, 6) // Show first 6 results on first page
                  .map(([key, value]) => {
                    const label = key
                      .replace("_result", "")
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ");

                    const notesKey = `${key.replace("_result", "_notes")}` as keyof ServiceRecord;
                    const notes = serviceRecord[notesKey];

                    return (
                      <div key={key} className="w-full rounded-lg border p-4 print:w-full print:block print:page-break-inside-avoid">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-base font-semibold">{label}</p>
                            {notes && typeof notes === 'string' && (
                              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                {notes}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 px-3 py-1 text-sm font-medium capitalize print:border",
                              resultColors[value as keyof typeof resultColors]
                            )}
                          >
                            {value}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Page */}
      <div className="print:relative print:m-0 print:p-0 print:w-[210mm] print:h-[297mm] print:overflow-hidden print:break-before-page">
        <div className="w-[210mm] h-[297mm] bg-white text-black p-[12mm] print:p-[12mm] mx-auto flex flex-col">
          <div className="flex-1">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-blue-600 border-b pb-2">Inspection Results (Continued)</h2>
                <div className="flex flex-col space-y-4 mt-4 print:space-y-4">
                  {Object.entries(serviceRecord)
                    .filter(([key]) => key.endsWith("_result"))
                    .slice(6) // Show remaining results on second page
                    .map(([key, value]) => {
                      const label = key
                        .replace("_result", "")
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");

                      const notesKey = `${key.replace("_result", "_notes")}` as keyof ServiceRecord;
                      const notes = serviceRecord[notesKey];

                      return (
                        <div key={key} className="w-full rounded-lg border p-4 print:w-full print:block print:page-break-inside-avoid">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-base font-semibold">{label}</p>
                              {notes && typeof notes === 'string' && (
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                  {notes}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 px-3 py-1 text-sm font-medium capitalize print:border",
                                resultColors[value as keyof typeof resultColors]
                              )}
                            >
                              {value}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="print:break-inside-avoid">
                <h2 className="text-xl font-semibold text-blue-600 border-b pb-2">Observations</h2>
                <p className="text-sm text-muted-foreground mb-2">
                  Additional comments relative to this thorough examination:
                </p>
                <div className="p-4 rounded-lg border bg-muted/50 print:border print:bg-transparent">
                  <p className="text-sm leading-relaxed">
                    {serviceRecord.observations || 'No observations recorded'}
                  </p>
                </div>
              </div>

              {/* Legal text and footer at bottom of second page */}
              <div className="mt-auto space-y-6 print:mt-auto">
                <div className="print:break-inside-avoid">
                  <div className="p-4 rounded-lg border print:border print:bg-transparent">
                    <p className="text-sm leading-relaxed">
                      The above equipment has been thoroughly inspected To be legally compliant with The Lifting Operations
                      and Lifting Equipment Regulations 1988 Regulation 9/3 and must be thoroughly examined at least every
                      12 months. (6 months recommended for vehicle lifts)
                    </p>
                    <p className="text-sm leading-relaxed mt-4">
                      <span className="font-medium">Safe to operate:</span><br />
                      No = defects which could cause a danger to persons.<br />
                      Remedial = identification of parts that require rectification but still safe to operate.<br />
                      Yes = Safe to operate.
                    </p>
                  </div>
                </div>

                <CertificateFooter notes={serviceRecord.notes}>
                  <div className="mt-4 border-t pt-4">
                    <p className="font-medium">Authorised Engineer: Paul Jones</p>
                    <p className="text-sm text-muted-foreground mt-1">HNC Electrical Mechanical Engineering</p>
                  </div>
                </CertificateFooter>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 