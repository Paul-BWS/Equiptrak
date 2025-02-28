interface SpotWelderParametersProps {
  serviceRecord: {
    voltage_max?: number | null;
    voltage_min?: number | null;
    air_pressure?: number | null;
    tip_pressure?: number | null;
    length?: number | null;
    diameter?: number | null;
  };
}

export function SpotWelderParameters({ serviceRecord }: SpotWelderParametersProps) {
  return (
    <div className="mb-0.5">
      <h2 className="text-lg font-semibold text-blue-600 mb-0.5">Parameters</h2>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <h3 className="text-sm font-semibold mb-0.5">Voltage Max</h3>
          <p className="text-base">{serviceRecord.voltage_max ?? 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-0.5">Voltage Min</h3>
          <p className="text-base">{serviceRecord.voltage_min ?? 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-0.5">Air Pressure</h3>
          <p className="text-base">{serviceRecord.air_pressure ?? 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-0.5">Tip Pressure</h3>
          <p className="text-base">{serviceRecord.tip_pressure ?? 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-0.5">Length</h3>
          <p className="text-base">{serviceRecord.length ?? 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-0.5">Diameter</h3>
          <p className="text-base">{serviceRecord.diameter ?? 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}