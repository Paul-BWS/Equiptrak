import { Navigation } from "@/components/Navigation";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AxleStandsHeader } from "@/components/axle-stands/AxleStandsHeader";
import { AxleStandsList } from "@/components/axle-stands/AxleStandsList";
import { AxleStandsReadingsModal } from "@/components/axle-stands/AxleStandsReadingsModal";
import { AxleStandsCertificateModal } from "@/components/axle-stands/AxleStandsCertificateModal";

const AxleStands = () => {
  const { customerId } = useParams();
  const [showReadingsModal, setShowReadingsModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  const { data: customerData } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) {
        console.error('Error fetching customer:', error);
        toast.error("Failed to load customer data");
        throw error;
      }

      return data;
    }
  });

  const { data: axleStands = [], isLoading } = useQuery({
    queryKey: ['equipment', customerId, 'axle-stands'],
    queryFn: async () => {
      const { data: equipmentData, error } = await supabase
        .from('axle_stands')
        .select(`
          id,
          company_id,
          model,
          serial_number,
          engineer,
          last_service_date,
          next_service_due,
          test_result,
          cert_number,
          status,
          notes
        `)
        .eq('company_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching axle stands:', error);
        toast.error("Failed to load axle stands data");
        throw error;
      }

      return equipmentData.map(stand => ({
        id: stand.id,
        model: stand.model || '',
        serialNumber: stand.serial_number || '',
        lastServiceDate: stand.last_service_date || '',
        nextServiceDue: stand.next_service_due || ''
      }));
    }
  });

  const { data: selectedEquipment } = useQuery({
    queryKey: ['equipment', selectedEquipmentId],
    queryFn: async () => {
      if (!selectedEquipmentId) return null;
      
      const { data, error } = await supabase
        .from('axle_stands')
        .select('*')
        .eq('id', selectedEquipmentId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedEquipmentId && showCertificateModal
  });

  const handleNewAxleStand = () => {
    setSelectedEquipmentId(null);
    setShowReadingsModal(true);
  };

  const handleGenerateCertificate = (id: string) => {
    setSelectedEquipmentId(id);
    setShowCertificateModal(true);
  };

  const handleViewReadings = (id: string) => {
    setSelectedEquipmentId(id);
    setShowReadingsModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto py-8">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-8">
        <div className="space-y-6">
          <AxleStandsHeader
            customerId={customerId!}
            customerName={customerData?.name}
            onNewAxleStand={handleNewAxleStand}
          />
          
          <AxleStandsList
            axleStands={axleStands}
            onNewAxleStand={handleNewAxleStand}
            onGenerateCertificate={handleGenerateCertificate}
            onViewReadings={handleViewReadings}
          />
        </div>
      </main>

      <AxleStandsReadingsModal
        open={showReadingsModal}
        onOpenChange={setShowReadingsModal}
        equipmentId={selectedEquipmentId}
      />

      {selectedEquipmentId && selectedEquipment && (
        <AxleStandsCertificateModal
          open={showCertificateModal}
          onOpenChange={setShowCertificateModal}
          equipment={selectedEquipment}
        />
      )}
    </div>
  );
};

export default AxleStands;