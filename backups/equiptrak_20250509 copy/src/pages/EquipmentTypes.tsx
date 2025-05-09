import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyId = searchParams.get('companyId');
  
  // Define equipment types with icons
  const equipmentTypes = [
    { 
      id: "compressors", 
      name: "Compressors", 
      icon: <Fan className="h-8 w-8 text-primary" />,
      url: "/compressors"
    },
    { 
      id: "spot-welders", 
      name: "Spot Welders", 
      icon: <ArrowLeftRight className="h-8 w-8 text-primary" />,
      url: "/spot-welders"
    },
    { 
      id: "loler", 
      name: "LOLER Equipment", 
      icon: <Forklift className="h-8 w-8 text-primary" />,
      url: "/loler"
    },
    { 
      id: "rivet-tools", 
      name: "Rivet Tools", 
      icon: <Drill className="h-8 w-8 text-primary" />,
      url: "/rivet-tools"
    },
    { 
      id: "service", 
      name: "Service Records", 
      icon: <Wrench className="h-8 w-8 text-primary" />,
      url: "/service"
    },
    { 
      id: "lift-service", 
      name: "Lift Service", 
      icon: <Forklift className="h-8 w-8 text-primary" />,
      url: "/lift-service"
    },
    { 
      id: "welder-validation", 
      name: "Welder Validation", 
      icon: <Zap className="h-8 w-8 text-primary" />,
      url: "/welder-validation"
    },
    { 
      id: "headlight-beam", 
      name: "Headlight Beam Setter", 
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      url: "/headlight-beam"
    },
    { 
      id: "pressure-gauges", 
      name: "Pressure Gauges", 
      icon: <Gauge className="h-8 w-8 text-primary" />,
      url: "/pressure-gauges"
    },
    { 
      id: "tyres-gauge", 
      name: "Tyres Gauge", 
      icon: <CircleDot className="h-8 w-8 text-primary" />,
      url: "/tyres-gauge"
    },
    { 
      id: "air-con", 
      name: "Air Con Machines", 
      icon: <Fan className="h-8 w-8 text-primary" />,
      url: "/air-con"
    },
    { 
      id: "paint-scales", 
      name: "Paint Scales", 
      icon: <Weight className="h-8 w-8 text-primary" />,
      url: "/paint-scales"
    },
    { 
      id: "jig-measuring", 
      name: "JIG Measuring", 
      icon: <Ruler className="h-8 w-8 text-primary" />,
      url: "/jig-measuring"
    },
    { 
      id: "temperature-gauges", 
      name: "Temperature Gauges", 
      icon: <Thermometer className="h-8 w-8 text-primary" />,
      url: "/temperature-gauges"
    },
    { 
      id: "puwer-inspection", 
      name: "PUWER Inspection", 
      icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
      url: "/puwer-inspection"
    },
    { 
      id: "lev", 
      name: "Local Exhaust Ventilation", 
      icon: <Cloud className="h-8 w-8 text-primary" />,
      url: "/lev"
    },
    { 
      id: "gas-equipment", 
      name: "Gas Equipment CP7", 
      icon: <Cylinder className="h-8 w-8 text-primary" />,
      url: "/gas-equipment"
    },
    { 
      id: "safety-equipment", 
      name: "Safety Equipment", 
      icon: <HardHat className="h-8 w-8 text-primary" />,
      url: "/safety-equipment"
    },
    { 
      id: "torque-wrench", 
      name: "Torque Wrench", 
      icon: <Circle className="h-8 w-8 text-primary" />,
      url: "/torque-wrench"
    },
    { 
      id: "clean-air", 
      name: "Clean Air", 
      icon: <Cloud className="h-8 w-8 text-primary" />,
      url: "/clean-air"
    },
    { 
      id: "tank-inspection", 
      name: "Tank Inspection", 
      icon: <Flame className="h-8 w-8 text-primary" />,
      url: "/tank-inspection"
    }
  ];
  
  const handleBack = () => {
    if (companyId) {
      navigate(`/company/${companyId}`);
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center mb-8">
          <Button 
            variant="back"
            onClick={handleBack}
            className="mr-4 rounded-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Equipment Types</h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {equipmentTypes.map((type) => (
            <div 
              key={type.id}
              className="bg-card dark:bg-card rounded-lg shadow-sm border border-border p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent dark:hover:bg-accent/50 transition-all duration-200"
              onClick={() => {
                if (type.url) {
                  const url = companyId 
                    ? `${type.url}?companyId=${companyId}` 
                    : type.url;
                  navigate(url);
                }
              }}
            >
              <div className="bg-background dark:bg-background rounded-full p-4 mb-4">
                {type.icon}
              </div>
              <h3 className="text-center font-medium text-foreground">{type.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EquipmentTypes;