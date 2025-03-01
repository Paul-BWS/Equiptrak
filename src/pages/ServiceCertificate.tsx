import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

export function ServiceCertificate() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  
  // Fetch service record data with company information
  const { data: record, isLoading } = useQuery({
    queryKey: ["service-record", recordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_records")
        .select(`
          *,
          companies (
            company_name,
            address,
            city,
            county,
            postcode
          )
        `)
        .eq("id", recordId)
        .single();
        
      if (error) throw error;
      return data;
    },
  });
  
  // Fetch customer data
  const { data: customer } = useQuery({
    queryKey: ["customer", record?.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", record?.company_id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!record?.company_id,
  });
  
  if (isLoading) {
    return <div className="container mx-auto py-6">Loading certificate...</div>;
  }
  
  if (!record) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="primaryBlue"
            size="icon"
            onClick={() => navigate('/admin')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Certificate not found</h1>
        </div>
      </div>
    );
  }
  
  // Update the back button to navigate to the admin page
  const handleBack = () => {
    if (record?.company_id) {
      navigate(`/admin/service/${record.company_id}`);
    } else {
      navigate('/admin');
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="primaryBlue"
            size="icon"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Certificate {record.certificate_number}</h1>
        </div>
        
        <Button 
          variant="outline"
          onClick={() => window.print()}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Certificate
        </Button>
      </div>
      
      <div className="bg-white p-8 rounded-lg border shadow-sm print:shadow-none">
        {/* Certificate content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Service Certificate</h2>
          <p className="text-lg">{record.certificate_number}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Customer</h3>
            <p>{customer?.company_name}</p>
            <p>{customer?.address}</p>
            <p>{customer?.city}, {customer?.county} {customer?.postcode}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Service Details</h3>
            <p><strong>Engineer:</strong> {record.engineer_name}</p>
            <p><strong>Test Date:</strong> {new Date(record.test_date).toLocaleDateString()}</p>
            <p><strong>Retest Date:</strong> {new Date(record.retest_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className="capitalize">{record.status}</span></p>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Equipment Tested</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Equipment</th>
                <th className="text-left py-2">Serial Number</th>
              </tr>
            </thead>
            <tbody>
              {record.equipment1_name && (
                <tr className="border-b">
                  <td className="py-2">{record.equipment1_name}</td>
                  <td className="py-2">{record.equipment1_serial}</td>
                </tr>
              )}
              {record.equipment2_name && (
                <tr className="border-b">
                  <td className="py-2">{record.equipment2_name}</td>
                  <td className="py-2">{record.equipment2_serial}</td>
                </tr>
              )}
              {record.equipment3_name && (
                <tr className="border-b">
                  <td className="py-2">{record.equipment3_name}</td>
                  <td className="py-2">{record.equipment3_serial}</td>
                </tr>
              )}
              {record.equipment4_name && (
                <tr className="border-b">
                  <td className="py-2">{record.equipment4_name}</td>
                  <td className="py-2">{record.equipment4_serial}</td>
                </tr>
              )}
              {record.equipment5_name && (
                <tr className="border-b">
                  <td className="py-2">{record.equipment5_name}</td>
                  <td className="py-2">{record.equipment5_serial}</td>
                </tr>
              )}
              {record.equipment6_name && (
                <tr className="border-b">
                  <td className="py-2">{record.equipment6_name}</td>
                  <td className="py-2">{record.equipment6_serial}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {record.notes && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p className="whitespace-pre-line">{record.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceCertificate; 