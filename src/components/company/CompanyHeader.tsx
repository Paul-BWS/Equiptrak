import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Wrench, MessageSquare } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Company {
  id: string;
  name?: string;
  company_name?: string;
  email?: string;
  telephone?: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  created_at?: string;
}

interface CompanyHeaderProps {
  company: Company;
  onEdit: () => void;
  hideChatButton?: boolean;
}

export function CompanyHeader({ company, onEdit, hideChatButton = false }: CompanyHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { customerId } = useParams();
  const location = useLocation();

  // Get the company name from either name or company_name field
  const companyName = company.name || company.company_name || "Unknown Company";
  
  console.log("CompanyHeader - Company data:", company);
  console.log("CompanyHeader - Company name:", companyName);

  const handleChatClick = () => {
    console.log("Chat button clicked in CompanyHeader");
    console.log("Current location:", location.pathname);
    console.log("Customer ID:", customerId);
    console.log("Company name:", companyName);

    if (!user?.id) {
      toast.error("You must be logged in to access chat");
      return;
    }

    if (!customerId) {
      toast.error("No company selected");
      return;
    }

    navigate(`/admin/customer/${customerId}/equipment/chat`);
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
      <div className="flex flex-col">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4 gap-2 w-fit bg-muted hover:bg-muted/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{companyName}</h2>
      </div>

      <div className="flex items-center gap-2">
        {!hideChatButton && (
          <Button
            variant="outline"
            onClick={handleChatClick}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onEdit}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Edit Details
        </Button>
      </div>
    </div>
  );
}