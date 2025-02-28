import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Wrench, MessageSquare } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CompanyHeaderProps {
  companyName: string;
  onBack: () => void;
  onEdit: () => void;
  hideChatButton?: boolean;
}

export function CompanyHeader({ companyName, onBack, onEdit, hideChatButton = false }: CompanyHeaderProps) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { customerId } = useParams();
  const location = useLocation();

  const handleChatClick = () => {
    console.log("Chat button clicked in CompanyHeader");
    console.log("Current location:", location.pathname);
    console.log("Customer ID:", customerId);
    console.log("Company name:", companyName);

    if (!session?.user?.id) {
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
          onClick={onBack}
          className="mb-4 gap-2 w-fit bg-muted hover:bg-muted/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{companyName}</h2>
      </div>
      <div className="flex items-start space-x-2">
        {!hideChatButton && (
          <Button 
            variant="outline"
            onClick={handleChatClick}
            className="gap-2 h-10"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={onEdit}
          className="gap-2 h-10"
        >
          <Settings className="h-4 w-4" />
          Edit Details
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate(`/admin/customer/${customerId}/equipment/types`)}
          className="gap-2 h-10"
        >
          <Wrench className="h-4 w-4" />
          Equipment Types
        </Button>
      </div>
    </div>
  );
}