import { 
  Wrench, 
  Zap,
  Settings,
  AirVent,
  Gauge,
  Car,
  Truck,
  Fan,
  PaintBucket,
  Flame,
  Ruler,
  Thermometer,
  Hammer,
  ClipboardCheck,
  Factory,
  AlertTriangle,
  Cylinder,
  Shield,
  Scale
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface EquipmentTypeNavProps {
  customerId?: string;
}

export function EquipmentTypeNav({ customerId }: EquipmentTypeNavProps) {
  const navigate = useNavigate();
  const basePath = customerId ? `/admin/customer/${customerId}` : '/admin';

  const equipmentTypes = [
    { icon: Wrench, label: "Service", path: `${basePath}/service` },
    { icon: Flame, label: "Spot Welder", path: `${basePath}/spot-welders` },
    { icon: AirVent, label: "Compressor", path: `${basePath}/equipment/compressors` },
    { icon: Zap, label: "Welder Validation", path: `${basePath}/equipment/welder-validation` },
    { icon: Hammer, label: "Rivet Tools", path: `${basePath}/equipment/rivet-tools` },
    { icon: Fan, label: "Air Con Machines", path: `${basePath}/equipment/air-con` },
    { icon: PaintBucket, label: "Paint Scales", path: `${basePath}/equipment/paint-scales` },
    { icon: Car, label: "Tyres Gauge", path: `${basePath}/equipment/tyres-gauge` },
    { icon: Wrench, label: "Torque Wrench", path: `${basePath}/equipment/torque-wrench` },
    { icon: Ruler, label: "JIG Measuring", path: `${basePath}/equipment/jig-measuring` },
    { icon: AirVent, label: "Clean Air", path: `${basePath}/equipment/clean-air` },
    { icon: Gauge, label: "Pressure Gauges", path: `${basePath}/equipment/pressure-gauges` },
    { icon: Ruler, label: "Measuring Tools", path: `${basePath}/equipment/measuring-tools` },
    { icon: Settings, label: "Headlight Beam Setter", path: `${basePath}/equipment/headlight-beam` },
    { icon: Thermometer, label: "Temperature Gauges", path: `${basePath}/equipment/temperature-gauges` },
    { icon: ClipboardCheck, label: "PUWER Inspection", path: `${basePath}/equipment/puwer-inspection` },
    { icon: Factory, label: "Local Exhaust Ventilation LEV", path: `${basePath}/equipment/lev` },
    { icon: AirVent, label: "Tank Inspection", path: `${basePath}/equipment/air-compressor` },
    { icon: Shield, label: "Safety Equipment", path: `${basePath}/equipment/safety-equipment` },
    { icon: Cylinder, label: "Gas Equipment CP7", path: `${basePath}/equipment/gas-equipment` },
    { icon: Scale, label: "LOLER", path: `${basePath}/loler` },
  ];

  // Function to render the icon with the correct color
  const renderColoredIcon = (IconComponent: any) => {
    return (
      <div style={{ color: "#7b96d4" }}>
        <IconComponent 
          size={32} 
          color="#7b96d4" 
          style={{ 
            color: "#7b96d4", 
            stroke: "#7b96d4" 
          }} 
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {equipmentTypes.map((type) => {
        return (
          <Link
            key={type.path}
            to={type.path}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            {renderColoredIcon(type.icon)}
            <span className="mt-2 text-center text-muted-foreground">{type.label}</span>
          </Link>
        );
      })}
    </div>
  );
}