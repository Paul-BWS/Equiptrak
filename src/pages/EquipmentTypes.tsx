import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Import icons for different equipment types
import { 
  Wrench, // For Service
  Zap, // For Welder Validation
  Lightbulb, // For Headlight Beam Setter
  Fan, // For Air Con Machines and Air Vent
  Gauge, // For Pressure Gauges
  CircleDot, // For Tyres Gauge (using CircleDot as a substitute for circle-gauge)
  Forklift, // For LOLER Lifting
  Weight, // For Paint Scales
  ArrowLeftRight, // For Spot Welder (using ArrowLeftRight as a substitute for between-horizontal-end)
  Ruler, // For JIG Measuring
  Thermometer, // For Temperature Gauges
  Drill, // For Rivet Tools
  ClipboardCheck, // For PUWER Inspection
  Cloud, // For Local Exhaust Ventilation LEV and Clean Air
  Cylinder, // For Gas Equipment CP7
  HardHat, // For Safety Equipment
  Circle, // For Torque Wrench (using Circle as a substitute for radius)
  Flame // For Tank Inspection (using Flame as a substitute for fire-extinguisher)
} from "lucide-react";

export function EquipmentTypes() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  
  // Fetch customer info (for reference, but we won't display it)
  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("id", customerId)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching customer:", error);
        return null;
      }
    },
    enabled: !!customerId
  });
  
  // Define equipment types with icons (hardcoded for now)
  const equipmentTypes = [
    { 
      id: "service", 
      name: "Service", 
      icon: <Wrench className="h-8 w-8 text-[#7b96d4]" />,
      onClick: () => navigate(`/admin/service/${customerId}`)
    },
    { id: "welder-validation", name: "Welder Validation", icon: <Zap className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "headlight-beam", name: "Headlight Beam Setter", icon: <Lightbulb className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "compressor", name: "Compressor", icon: <Fan className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "pressure-gauges", name: "Pressure Gauges", icon: <Gauge className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "tyres-gauge", name: "Tyres Gauge", icon: <CircleDot className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "loler-lifting", name: "LOLER Lifting", icon: <Forklift className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "air-con", name: "Air Con Machines", icon: <Fan className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "paint-scales", name: "Paint Scales", icon: <Weight className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "spot-welder", name: "Spot Welder", icon: <ArrowLeftRight className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "jig-measuring", name: "JIG Measuring", icon: <Ruler className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "temperature-gauges", name: "Temperature Gauges", icon: <Thermometer className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "rivet-tools", name: "Rivet Tools", icon: <Drill className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "puwer-inspection", name: "PUWER Inspection", icon: <ClipboardCheck className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "lev", name: "Local Exhaust Ventilation", icon: <Cloud className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "gas-equipment", name: "Gas Equipment CP7", icon: <Cylinder className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "safety-equipment", name: "Safety Equipment", icon: <HardHat className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "torque-wrench", name: "Torque Wrench", icon: <Circle className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "clean-air", name: "Clean Air", icon: <Cloud className="h-8 w-8 text-[#7b96d4]" /> },
    { id: "tank-inspection", name: "Tank Inspection", icon: <Flame className="h-8 w-8 text-[#7b96d4]" /> },
  ];
  
  return (
    <div className="bg-[#f5f5f5] min-h-screen -mt-6 -mx-4 px-4 pt-6 pb-6">
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="primaryBlue"
            size="icon"
            onClick={() => navigate(`/admin/customer/${customerId}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-[24px] font-bold">Equipment Types</h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {equipmentTypes.map((type) => (
            <div 
              key={type.id} 
              className="bg-white rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={type.onClick || (() => navigate(`/admin/customer/${customerId}/equipment/${type.id}`))}
            >
              {type.icon}
              <h3 className="font-medium mt-3">{type.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EquipmentTypes;