import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Building2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Company {
  id: string;
  company_name: string;
  telephone?: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
}

interface CustomerTableProps {
  companies: Company[];
  isLoading: boolean;
  onDeleteCompany: (id: string) => void;
}

export function CustomerTable({ companies, isLoading, onDeleteCompany }: CustomerTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Telephone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Telephone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No companies found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Telephone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>{company.company_name}</TableCell>
              <TableCell>
                {[company.city, company.county, company.postcode]
                  .filter(Boolean)
                  .join(", ")}
              </TableCell>
              <TableCell>{company.telephone || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/customer/${company.id}/details`)}
                  >
                    <Building2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/customer/${company.id}/contacts`)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteCompany(company.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}