interface EquipmentItem {
  name: string;
  serial: string;
}

interface EquipmentListProps {
  serviceRecord: Record<string, any>;
}

export function CertificateEquipment({ serviceRecord }: EquipmentListProps) {
  const renderEquipmentItems = () => {
    const items = [];
    for (let i = 1; i <= 8; i++) {
      const nameField = `equipment${i}_name` as keyof typeof serviceRecord;
      const serialField = `equipment${i}_serial` as keyof typeof serviceRecord;
      
      if (serviceRecord[nameField]) {
        items.push(
          <tr key={i} className="border-b border-gray-200">
            <td className="py-2 text-base text-black">{serviceRecord[nameField]}</td>
            <td className="py-2 text-base text-right text-black">{serviceRecord[serialField]}</td>
          </tr>
        );
      }
    }
    return items;
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-blue-600 mb-4">Equipment</h2>
      <div>
        <div className="grid grid-cols-2 mb-2">
          <h3 className="text-base font-semibold text-black">Equipment Type</h3>
          <h3 className="text-base font-semibold text-black text-right">Equipment Serial</h3>
        </div>
        <table className="w-full">
          <tbody>
            {renderEquipmentItems()}
          </tbody>
        </table>
      </div>
    </div>
  );
}