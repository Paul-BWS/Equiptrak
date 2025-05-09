import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CertificateEquipmentProps {
  serviceRecord: any;
}

export function CertificateEquipment({ serviceRecord }: CertificateEquipmentProps) {
  // Get all equipment items from the service record
  const equipmentItems = [
    { name: serviceRecord.equipment1_name, serial: serviceRecord.equipment1_serial },
    { name: serviceRecord.equipment2_name, serial: serviceRecord.equipment2_serial },
    { name: serviceRecord.equipment3_name, serial: serviceRecord.equipment3_serial },
    { name: serviceRecord.equipment4_name, serial: serviceRecord.equipment4_serial },
    { name: serviceRecord.equipment5_name, serial: serviceRecord.equipment5_serial },
    { name: serviceRecord.equipment6_name, serial: serviceRecord.equipment6_serial },
  ].filter(item => item.name); // Filter out empty items

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-2">Equipment</h3>
      <Table className="border-collapse w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="border border-gray-300 text-center font-bold py-2 w-1/2">Equipment Type</TableHead>
            <TableHead className="border border-gray-300 text-center font-bold py-2 w-1/2">Equipment Serial</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipmentItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="border border-gray-300 text-center py-2">{item.name || "N/A"}</TableCell>
              <TableCell className="border border-gray-300 text-center py-2">{item.serial || "N/A"}</TableCell>
            </TableRow>
          ))}
          {/* Add empty rows if there are less than 6 items */}
          {Array.from({ length: Math.max(0, 6 - equipmentItems.length) }).map((_, index) => (
            <TableRow key={`empty-${index}`}>
              <TableCell className="border border-gray-300 text-center py-2">&nbsp;</TableCell>
              <TableCell className="border border-gray-300 text-center py-2">&nbsp;</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}