import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { Equipment } from "@/types/equipment";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Calendar, Tag, RotateCw, Search, Plus, CheckCircle, AlertCircle, XCircle, FileText, Wrench } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ViewSpotWelderModal } from "@/components/spot-welder/ViewSpotWelderModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface EquipmentListProps {
  companyId?: string;
  onEquipmentClick?: (equipment: Equipment) => void;
  showCompanyName?: boolean;
  showAddButton?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  showActions?: boolean;
  showStatus?: boolean;
  showType?: boolean;
  showDates?: boolean;
  showNotes?: boolean;
  showCompanyDetails?: boolean;
  showEquipmentDetails?: boolean;
  showServiceHistory?: boolean;
  showCertificates?: boolean;
  showFaultReports?: boolean;
  showMaintenanceRecords?: boolean;
  showCalibrationRecords?: boolean;
  showInspectionRecords?: boolean;
  showTestResults?: boolean;
  showDocuments?: boolean;
  showPhotos?: boolean;
  showVideos?: boolean;
  showComments?: boolean;
  showTags?: boolean;
  showCategories?: boolean;
  showCustomFields?: boolean;
  showAuditTrail?: boolean;
  showMetadata?: boolean;
  showCreatedBy?: boolean;
  showUpdatedBy?: boolean;
  showCreatedAt?: boolean;
  showUpdatedAt?: boolean;
  showVersion?: boolean;
  showRevision?: boolean;
  showArchived?: boolean;
  showDeleted?: boolean;
  showHidden?: boolean;
  showSystem?: boolean;
  showInternal?: boolean;
  showExternal?: boolean;
  showPublic?: boolean;
  showPrivate?: boolean;
  showShared?: boolean;
  showOwned?: boolean;
  showManaged?: boolean;
  showAssigned?: boolean;
  showUnassigned?: boolean;
  showActive?: boolean;
  showInactive?: boolean;
  showPending?: boolean;
  showCompleted?: boolean;
  showCancelled?: boolean;
  showExpired?: boolean;
  showDraft?: boolean;
  showPublished?: boolean;
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  companyId,
  onEquipmentClick,
  showCompanyName = true,
  showAddButton = true,
  showFilters = true,
  showSearch = true,
  showPagination = true,
  pageSize = 10,
  showActions = true,
  showStatus = true,
  showType = true,
  showDates = true,
  showNotes = true,
  showCompanyDetails = true,
  showEquipmentDetails = true,
  showServiceHistory = true,
  showCertificates = true,
  showFaultReports = true,
  showMaintenanceRecords = true,
  showCalibrationRecords = true,
  showInspectionRecords = true,
  showTestResults = true,
  showDocuments = true,
  showPhotos = true,
  showVideos = true,
  showComments = true,
  showTags = true,
  showCategories = true,
  showCustomFields = true,
  showAuditTrail = true,
  showMetadata = true,
  showCreatedBy = true,
  showUpdatedBy = true,
  showCreatedAt = true,
  showUpdatedAt = true,
  showVersion = true,
  showRevision = true,
  showArchived = true,
  showDeleted = true,
  showHidden = true,
  showSystem = true,
  showInternal = true,
  showExternal = true,
  showPublic = true,
  showPrivate = true,
  showShared = true,
  showOwned = true,
  showManaged = true,
  showAssigned = true,
  showUnassigned = true,
  showActive = true,
  showInactive = true,
  showPending = true,
  showCompleted = true,
  showCancelled = true,
  showExpired = true,
  showDraft = true,
  showPublished = true,
}) => {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        let query = supabase.from('equipment').select('*');

        if (companyId) {
          query = query.eq('company_id', companyId);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setEquipment(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [companyId, supabase]);

  if (loading) {
    return <div>Loading equipment...</div>;
  }

  if (error) {
    return <div>Error loading equipment: {error.message}</div>;
  }

  return (
    <div>
      {equipment.map((item) => (
        <div key={item.id} onClick={() => onEquipmentClick?.(item)}>
          <h3>{item.name}</h3>
          <p>Serial Number: {item.serial_number}</p>
          {showStatus && <p>Status: {item.status}</p>}
          {showType && <p>Type: {item.type}</p>}
          {showDates && (
            <>
              <p>Next Test Date: {item.next_test_date}</p>
              <p>Last Test Date: {item.last_test_date}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default EquipmentList;

export function EquipmentListAdmin({ searchQuery = "" }: { searchQuery?: string }) {
  const navigate = useNavigate();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["all-equipment", searchQuery],
    queryFn: async () => {
      const { data } = await axios.get<Equipment[]>(`/api/equipment${searchQuery ? `?search=${searchQuery}` : ''}`);
      return data;
    },
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleViewEquipment = (equipmentId: string) => {
    navigate(`/admin/equipment/${equipmentId}`);
  };
  
  const handleServiceClick = (equipmentId: string) => {
    navigate(`/admin/equipment/${equipmentId}/service`);
  };
  
  const handleCertificateClick = (equipmentId: string) => {
    navigate(`/admin/equipment/${equipmentId}/certificate`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (!equipment || equipment.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No equipment found</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Serial Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Last Test</TableHead>
            <TableHead>Next Test</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.serial_number}</TableCell>
              <TableCell>{item.equipment_types?.name || "Unknown"}</TableCell>
              <TableCell>{item.profiles?.company_name || "Unknown"}</TableCell>
              <TableCell>{item.last_test_date ? new Date(item.last_test_date).toLocaleDateString() : "Never"}</TableCell>
              <TableCell>{item.next_test_date ? new Date(item.next_test_date).toLocaleDateString() : "Not scheduled"}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(item.status)}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewEquipment(item.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 