interface SpotWelderTestDataProps {
  serviceRecord: {
    welding_time_1?: number | null;
    welding_time_2?: number | null;
    welding_time_3?: number | null;
    welding_time_4?: number | null;
    machine_time_1?: number | null;
    machine_time_2?: number | null;
    machine_time_3?: number | null;
    machine_time_4?: number | null;
    welding_current_1?: number | null;
    welding_current_2?: number | null;
    welding_current_3?: number | null;
    welding_current_4?: number | null;
    machine_current_1?: number | null;
    machine_current_2?: number | null;
    machine_current_3?: number | null;
    machine_current_4?: number | null;
  };
}

export function SpotWelderTestData({ serviceRecord }: SpotWelderTestDataProps) {
  const readings = [1, 2, 3, 4].map(index => ({
    weldingCurrent: serviceRecord[`welding_current_${index}` as keyof typeof serviceRecord],
    machineCurrent: serviceRecord[`machine_current_${index}` as keyof typeof serviceRecord],
    weldingTime: serviceRecord[`welding_time_${index}` as keyof typeof serviceRecord],
    machineTime: serviceRecord[`machine_time_${index}` as keyof typeof serviceRecord],
  }));

  return (
    <div className="mb-1">
      <h2 className="text-lg font-semibold text-blue-600 mb-0.5">Test Data</h2>
      <div className="w-full">
        <div className="grid grid-cols-4 gap-4 mb-2">
          <h3 className="text-sm font-semibold">Welding Current</h3>
          <h3 className="text-sm font-semibold">Machine Current</h3>
          <h3 className="text-sm font-semibold">Welding Time</h3>
          <h3 className="text-sm font-semibold">Machine Time</h3>
        </div>
        {readings.map((reading, index) => {
          if (!reading.weldingCurrent && !reading.machineCurrent && !reading.weldingTime && !reading.machineTime) {
            return null;
          }
          return (
            <div key={index} className="grid grid-cols-4 gap-4 py-1 border-b border-gray-200">
              <p className="text-base">{reading.weldingCurrent ?? 'N/A'}</p>
              <p className="text-base">{reading.machineCurrent ?? 'N/A'}</p>
              <p className="text-base">{reading.weldingTime ?? 'N/A'}</p>
              <p className="text-base">{reading.machineTime ?? 'N/A'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}