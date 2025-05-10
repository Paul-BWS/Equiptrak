import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, QrCode, FileText } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddServiceForm } from "@/components/service/forms/AddServiceForm";

export default function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyIdParam = searchParams.get('companyId');
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(isEditing);
  const [companyName, setCompanyName] = useState("");
  const [serviceRecord, setServiceRecord] = useState(null);
  const [companyId, setCompanyId] = useState(companyIdParam || "");
  const { user } = useAuth();
  const [formRef, setFormRef] = useState<any>(null);
  
  useEffect(() => {
    // If editing, fetch the service record
    if (isEditing && id && user?.token) {
      fetchServiceRecord();
    } else if (companyIdParam && user?.token) {
      // If creating a new record, get the company name
      setCompanyId(companyIdParam);
      fetchCompanyName();
    }
  }, [id, companyIdParam, user?.token]);
  
  const fetchServiceRecord = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/service-records/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch service record: ${response.status}`);
      }
      
      const data = await response.json();
      setServiceRecord(data);
      
      // Store the company ID from the service record
      if (data.company_id) {
        setCompanyId(data.company_id);
      }
      
      // Get company name if it's not in the data
      if (!data.company || !data.company.company_name) {
        const companyResponse = await fetch(`/api/companies/${data.company_id}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          setCompanyName(companyData.company_name);
        }
      } else {
        setCompanyName(data.company.company_name);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching service record:", error);
      toast.error("Failed to load service record");
      setLoading(false);
    }
  };
  
  const fetchCompanyName = async () => {
    try {
      const response = await fetch(`/api/companies/${companyIdParam}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanyName(data.company_name);
      }
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  };
  
  const handleBack = () => {
    // Use stored companyId which comes either from URL param or from fetched service record
    if (companyId) {
      navigate(`/service?companyId=${companyId}`);
    } else {
      navigate('/service');
    }
  };
  
  const handleSuccess = () => {
    // Use stored companyId which comes either from URL param or from fetched service record
    if (companyId) {
      navigate(`/service?companyId=${companyId}`);
    } else {
      navigate('/service');
    }
    toast.success(`Service record ${isEditing ? 'updated' : 'created'} successfully`);
  };

  const handleViewCertificate = () => {
    if (id) {
      // Pass the company ID to the certificate page via query parameter
      navigate(`/service-certificate/${id}?companyId=${companyId}`);
    }
  };

  const handleQRCode = () => {
    if (id) {
      // Pass the company ID to the QR code page via query parameter
      navigate(`/service-certificate/${id}/qr?companyId=${companyId}`);
    }
  };

  const handleSaveRecord = () => {
    if (formRef) {
      formRef.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };
  
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="outline" onClick={handleBack} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          
          <div className="flex space-x-2">
            {isEditing && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleQRCode}
                  className="flex items-center"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Code
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleViewCertificate}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Certificate
                </Button>
              </>
            )}
            <Button 
              onClick={handleSaveRecord} 
              className="bg-[#10b981] hover:bg-[#10b981]/90 text-white"
            >
              {isEditing ? "Update Record" : "Save Record"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <span className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-primary"></span>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing 
                  ? `Edit Service Record for ${companyName}`
                  : `New Service Record for ${companyName}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddServiceForm 
                customerId={companyId || ""}
                serviceRecord={serviceRecord}
                isEditing={isEditing}
                onSuccess={handleSuccess}
                onCancel={handleBack}
                setFormRef={setFormRef}
                showActionButtons={false}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 