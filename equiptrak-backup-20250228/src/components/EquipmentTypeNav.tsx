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
  Scale,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface EquipmentTypeNavProps {
  customerId?: string;
}

export function EquipmentTypeNav({ customerId }: EquipmentTypeNavProps) {
  const navigate = useNavigate();
  const basePath = customerId ? `/admin/customer/${customerId}` : '/admin';

  const equipmentTypes = [
    { icon: Wrench, label: "Service", path: `${basePath}/service` },
    { icon: Flame, label: "Spot Welder", path: `${basePath}/spot-welders` },
    { icon: AirVent, label: "Compressor", path: `${basePath}/compressors` },
    { icon: Zap, label: "Welder Validation", path: `${basePath}/equipment/welder-validation` },
    { icon: Hammer, label: "Rivet Tools", path: `${basePath}/rivet-tools` },
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {equipmentTypes.map((type) => {
        const Icon = type.icon;
        return (
          <div
            key={type.path}
            onClick={() => navigate(type.path)}
            className={cn(
              "group relative",
              "bg-background hover:bg-accent dark:bg-muted dark:hover:bg-accent",
              "rounded-xl border border-border hover:border-primary",
              "p-6 cursor-pointer transition-all duration-300",
              "flex flex-col items-center justify-center gap-4",
              "min-h-[200px]",
              "shadow-sm hover:shadow-md hover:-translate-y-1"
            )}
          >
            <Icon 
              className="w-16 h-16 text-muted-foreground group-hover:text-primary transition-colors duration-300" 
              strokeWidth={1.5} 
            />

            <span className="text-lg font-medium text-center text-muted-foreground group-hover:text-primary transition-colors duration-300">
              {type.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}