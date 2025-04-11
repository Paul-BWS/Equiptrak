import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Wrench, Mail, Search } from "lucide-react";
import { CompanyInformation } from "./CompanyInformation";
import { ContactList } from "@/components/contacts/ContactList";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, addDays, isWithinInterval } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Company {
  id: string;
  name?: string;
  company_name?: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  telephone?: string;
  email?: string;
  website?: string;
  company_type?: string;
  status?: string;
  credit_rating?: string;
  site_address?: string;
  billing_address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  industry?: string;
  company_status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  next_service: string | null;
  company_id: string;
}

interface CompanyTabsProps {
  company: Company;
  equipment: Equipment[];
  isEquipmentLoading: boolean;
}

export function CompanyTabs({ company, equipment, isEquipmentLoading }: CompanyTabsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Get the company name and email from either field
  const companyName = company.name || company.company_name || "Unknown Company";
  const companyEmail = company.contact_email || "";
  
  console.log("CompanyTabs - Company data:", company);
  console.log("CompanyTabs - Company name:", companyName);
  console.log("CompanyTabs - Company email:", companyEmail);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const handleSendReminder = (equipmentName: string, email: string) => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No email address available for this company",
      });
      return;
    }

    // This would typically send an API request to send an email
    console.log(`Sending reminder for ${equipmentName} to ${email}`);
    
    toast({
      title: "Reminder Sent",
      description: `Service reminder for ${equipmentName} sent to ${email}`,
    });
  };

  const sortAndFilterEquipment = () => {
    const today = new Date();
    return equipment
      .filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchLower) ||
          item.serial_number.toLowerCase().includes(searchLower)
        );
      })
      .map(item => {
        let status = 'valid';
        if (item.next_service) {
          const nextService = new Date(item.next_service);
          if (nextService <= today) {
            status = 'expired';
          } else if (isWithinInterval(nextService, { start: today, end: addDays(today, 30) })) {
            status = 'upcoming';
          }
        }
        return { ...item, status };
      })
      .sort((a, b) => {
        if (!a.next_service && !b.next_service) return 0;
        if (!a.next_service) return 1;
        if (!b.next_service) return -1;
        return new Date(a.next_service).getTime() - new Date(b.next_service).getTime();
      });
  };

  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList>
        <TabsTrigger value="details" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Company Details
        </TabsTrigger>
        <TabsTrigger value="contacts" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Contacts
        </TabsTrigger>
        <TabsTrigger value="equipment" className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Equipment
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <CompanyInformation company={company} />
      </TabsContent>

      <TabsContent value="contacts">
        <ContactList companyId={company.id} />
      </TabsContent>

      <TabsContent value="equipment">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isEquipmentLoading ? (
            <div className="text-center py-4">Loading equipment...</div>
          ) : equipment.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No equipment found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment Name</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Next Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortAndFilterEquipment().map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.serial_number}</TableCell>
                    <TableCell>
                      {item.next_service ? format(new Date(item.next_service), 'dd/MM/yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(item.status)}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendReminder(item.name, companyEmail)}
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Send Reminder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}