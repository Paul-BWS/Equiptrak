import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Import icons for different equipment types
import { 
  Wrench, // For Service
  Zap, // For Welder Validation
  Lightbulb, // For Headlight Beam Setter
  Fan, // For Air Con Machines and Air Vent
  Gauge, // For Pressure Gauges
  CircleDot, // For Tyres Gauge
  Forklift, // For LOLER Lifting
  Weight, // For Paint Scales
  ArrowLeftRight, // For Spot Welder
  Ruler, // For JIG Measuring
  Thermometer, // For Temperature Gauges
  Drill, // For Rivet Tools
  ClipboardCheck, // For PUWER Inspection
  Cloud, // For Local Exhaust Ventilation LEV and Clean Air
  Cylinder, // For Gas Equipment CP7
  HardHat, // For Safety Equipment
  Circle, // For Torque Wrench
  Flame // For Tank Inspection
} from "lucide-react";

export function EquipmentTypes() {
  const navigate = useNavigate();
  
  // Define equipment types with icons
  const equipmentTypes = [
    { 
      id: "compressors", 
      name: "Compressors", 
      icon: <Fan className="h-8 w-8 text-[#7b96d4]" />,
      url: "/compressors"
    },
    { 
      id: "spot-welders", 
      name: "Spot Welders", 
      icon: <ArrowLeftRight className="h-8 w-8 text-[#7b96d4]" />,
      url: "/spot-welders"
    },
    { 
      id: "loler", 
      name: "LOLER Equipment", 
      icon: <Forklift className="h-8 w-8 text-[#7b96d4]" />,
      url: "/loler"
    },
    { 
      id: "rivet-tools", 
      name: "Rivet Tools", 
      icon: <Drill className="h-8 w-8 text-[#7b96d4]" />,
      url: "/rivet-tools"
    },
    { 
      id: "service", 
      name: "Service Records", 
      icon: <Wrench className="h-8 w-8 text-[#7b96d4]" />,
      url: "/service"
    },
    { 
      id: "welder-validation", 
      name: "Welder Validation", 
      icon: <Zap className="h-8 w-8 text-[#7b96d4]" />,
      url: "/welder-validation"
    },
    { 
      id: "headlight-beam", 
      name: "Headlight Beam Setter", 
      icon: <Lightbulb className="h-8 w-8 text-[#7b96d4]" />,
      url: "/headlight-beam"
    },
    { 
      id: "pressure-gauges", 
      name: "Pressure Gauges", 
      icon: <Gauge className="h-8 w-8 text-[#7b96d4]" />,
      url: "/pressure-gauges"
    },
    { 
      id: "tyres-gauge", 
      name: "Tyres Gauge", 
      icon: <CircleDot className="h-8 w-8 text-[#7b96d4]" />,
      url: "/tyres-gauge"
    },
    { 
      id: "air-con", 
      name: "Air Con Machines", 
      icon: <Fan className="h-8 w-8 text-[#7b96d4]" />,
      url: "/air-con"
    },
    { 
      id: "paint-scales", 
      name: "Paint Scales", 
      icon: <Weight className="h-8 w-8 text-[#7b96d4]" />,
      url: "/paint-scales"
    },
    { 
      id: "jig-measuring", 
      name: "JIG Measuring", 
      icon: <Ruler className="h-8 w-8 text-[#7b96d4]" />,
      url: "/jig-measuring"
    },
    { 
      id: "temperature-gauges", 
      name: "Temperature Gauges", 
      icon: <Thermometer className="h-8 w-8 text-[#7b96d4]" />,
      url: "/temperature-gauges"
    },
    { 
      id: "puwer-inspection", 
      name: "PUWER Inspection", 
      icon: <ClipboardCheck className="h-8 w-8 text-[#7b96d4]" />,
      url: "/puwer-inspection"
    },
    { 
      id: "lev", 
      name: "Local Exhaust Ventilation", 
      icon: <Cloud className="h-8 w-8 text-[#7b96d4]" />,
      url: "/lev"
    },
    { 
      id: "gas-equipment", 
      name: "Gas Equipment CP7", 
      icon: <Cylinder className="h-8 w-8 text-[#7b96d4]" />,
      url: "/gas-equipment"
    },
    { 
      id: "safety-equipment", 
      name: "Safety Equipment", 
      icon: <HardHat className="h-8 w-8 text-[#7b96d4]" />,
      url: "/safety-equipment"
    },
    { 
      id: "torque-wrench", 
      name: "Torque Wrench", 
      icon: <Circle className="h-8 w-8 text-[#7b96d4]" />,
      url: "/torque-wrench"
    },
    { 
      id: "clean-air", 
      name: "Clean Air", 
      icon: <Cloud className="h-8 w-8 text-[#7b96d4]" />,
      url: "/clean-air"
    },
    { 
      id: "tank-inspection", 
      name: "Tank Inspection", 
      icon: <Flame className="h-8 w-8 text-[#7b96d4]" />,
      url: "/tank-inspection"
    }
  ];
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline"
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Equipment Types</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {equipmentTypes.map((type) => (
          <div 
            key={type.id}
            className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              if (type.url) {
                navigate(type.url);
              }
            }}
          >
            <div className="bg-[#f5f5f5] rounded-full p-4 mb-4">
              {type.icon}
            </div>
            <h3 className="text-center font-medium">{type.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EquipmentTypes;