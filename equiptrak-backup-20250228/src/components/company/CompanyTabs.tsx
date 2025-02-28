import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Wrench, Mail, Search } from "lucide-react";
import { CompanyInformation } from "./CompanyInformation";
import { ContactList } from "@/components/contacts/ContactList";
import { Profile } from "@/types/database";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, addDays, isWithinInterval } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MapsProvider } from '@/components/maps/MapsContext';

interface CompanyTabsProps {
  company: Profile;
  equipment: any[];
  isEquipmentLoading: boolean;
  customerId: string;
}

export function CompanyTabs({ company, equipment, isEquipmentLoading, customerId }: CompanyTabsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'upcoming':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleSendReminder = async (equipmentName: string, email: string) => {
    try {
      const response = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          equipmentName,
        }),
      });

      if (response.ok) {
        toast({
          title: "Reminder Sent",
          description: `Email reminder sent for ${equipmentName}`,
        });
      } else {
        throw new Error('Failed to send reminder');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder email",
        variant: "destructive",
      });
    }
  };

  const sortAndFilterEquipment = () => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);

    return equipment
      .filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const nextTestDate = format(new Date(item.next_test_date), "dd/MM/yyyy");
        const lastTestDate = format(new Date(item.last_test_date), "dd/MM/yyyy");
        
        return (
          item.name.toLowerCase().includes(searchLower) ||
          item.serial_number.toLowerCase().includes(searchLower) ||
          (item.equipment_types?.name || '').toLowerCase().includes(searchLower) ||
          nextTestDate.includes(searchTerm) ||
          lastTestDate.includes(searchTerm) ||
          item.status.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        const aDate = new Date(a.next_test_date);
        const bDate = new Date(b.next_test_date);
        
        // Check if item is due for retest in next 30 days
        const aIsDueSoon = isWithinInterval(aDate, { start: today, end: thirtyDaysFromNow });
        const bIsDueSoon = isWithinInterval(bDate, { start: today, end: thirtyDaysFromNow });
        
        if (aIsDueSoon && !bIsDueSoon) return -1;
        if (!aIsDueSoon && bIsDueSoon) return 1;
        
        // If both or neither are due soon, sort by next test date
        return aDate.getTime() - bDate.getTime();
      });
  };

  return (
    <div className="bg-card rounded-lg border border-border/50">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
          <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            <Building2 className="mr-2 h-4 w-4" />
            Company Details
          </TabsTrigger>
          <TabsTrigger value="contacts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            <Users className="mr-2 h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="equipment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            <Wrench className="mr-2 h-4 w-4" />
            Equipment
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="p-6">
          <MapsProvider>
            <CompanyInformation company={company} />
          </MapsProvider>
        </TabsContent>
        
        <TabsContent value="contacts" className="p-6">
          <ContactList companyId={customerId} />
        </TabsContent>
        
        <TabsContent value="equipment" className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by type, serial number, test dates or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {isEquipmentLoading ? (
              <div>Loading equipment...</div>
            ) : equipment.length === 0 ? (
              <div>No equipment found for this company.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Test Date</TableHead>
                    <TableHead>Retest Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortAndFilterEquipment().map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.serial_number}</TableCell>
                      <TableCell>{item.equipment_types?.name || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(item.last_test_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(new Date(item.next_test_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeColor(item.status)} text-white`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.status === 'upcoming' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSendReminder(item.name, company.email || '')}
                            className="ml-2"
                            title="Send Email Reminder"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}