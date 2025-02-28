import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  last_test_date: string;
  next_test_date: string;
  status: "valid" | "expired" | "upcoming";
  equipment_types?: {
    name: string;
    description: string | null;
  } | null;
}

interface CustomerEquipmentTableProps {
  equipment: Equipment[];
  isLoading: boolean;
}

export function CustomerEquipmentTable({ equipment, isLoading }: CustomerEquipmentTableProps) {
  const statusColors = {
    valid: "bg-green-500",
    expired: "bg-red-500",
    upcoming: "bg-yellow-500",
  };

  if (isLoading) {
    return <div>Loading equipment...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment</TableHead>
            <TableHead>Serial Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Test Date</TableHead>
            <TableHead>Retest Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!equipment?.length ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No equipment found
              </TableCell>
            </TableRow>
          ) : (
            equipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.serial_number}</TableCell>
                <TableCell>{item.equipment_types?.name || "N/A"}</TableCell>
                <TableCell>
                  {format(new Date(item.last_test_date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(item.next_test_date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <Badge className={`${statusColors[item.status]} text-white`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}