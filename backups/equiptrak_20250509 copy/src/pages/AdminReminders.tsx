import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mail, BellOff, Filter, Search } from "lucide-react";
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from '@/components/theme-provider';

// Mock data - Replace with actual API calls
const MOCK_REMINDERS = [
  {
    id: '1',
    companyName: 'Acme Corporation',
    equipmentName: 'Forklift F201',
    serialNumber: 'FL-2023-001',
    serviceDate: '2023-12-15',
    nextServiceDate: '2024-03-15',
    contactEmail: 'maintenance@acme.com',
    status: 'upcoming',
    reminderSent: false
  },
  {
    id: '2',
    companyName: 'TechSolutions Inc',
    equipmentName: 'Crane C305',
    serialNumber: 'CR-2022-102',
    serviceDate: '2023-11-10',
    nextServiceDate: '2024-02-10',
    contactEmail: 'service@techsolutions.com',
    status: 'upcoming',
    reminderSent: true
  },
  {
    id: '3',
    companyName: 'Global Industries',
    equipmentName: 'Generator G100',
    serialNumber: 'GEN-2023-044',
    serviceDate: '2023-09-05',
    nextServiceDate: '2024-01-05',
    contactEmail: 'maintenance@global.com',
    status: 'expired',
    reminderSent: true
  },
  {
    id: '4',
    companyName: 'Metro Services',
    equipmentName: 'Lift L440',
    serialNumber: 'LFT-2023-210',
    serviceDate: '2023-10-20',
    nextServiceDate: '2024-04-20',
    contactEmail: 'ops@metroservices.com',
    status: 'valid',
    reminderSent: false
  }
];

export function AdminReminders() {
  const [reminders, setReminders] = useState(MOCK_REMINDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, expired, valid
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // In a real implementation, fetch reminders data from API
  useEffect(() => {
    // Simulating loading
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // API call would be here:
    // const fetchReminders = async () => {
    //   try {
    //     const response = await fetch('/api/reminders');
    //     const data = await response.json();
    //     setReminders(data);
    //   } catch (error) {
    //     console.error('Error fetching reminders:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchReminders();
  }, []);

  const handleSendReminder = async (id: string, email: string, equipmentName: string) => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No email address available for this company",
      });
      return;
    }

    // Here you would make an API call to send the reminder
    // For now, just update the UI
    setReminders(prevReminders => 
      prevReminders.map(reminder => 
        reminder.id === id ? { ...reminder, reminderSent: true } : reminder
      )
    );
    
    toast({
      title: "Reminder Sent",
      description: `Service reminder for ${equipmentName} sent to ${email}`,
    });
  };

  const handleDismissReminder = (id: string) => {
    // Here you would make an API call to dismiss/mark the reminder as handled
    // For now, just update the UI by removing it
    setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== id));
    
    toast({
      title: "Reminder Dismissed",
      description: "Reminder has been dismissed and will not appear again",
    });
  };

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

  const filteredReminders = reminders
    .filter(reminder => {
      // Filter by status
      if (filter !== 'all' && reminder.status !== filter) {
        return false;
      }
      
      // Search query filtering
      const query = searchQuery.toLowerCase();
      return (
        reminder.companyName.toLowerCase().includes(query) ||
        reminder.equipmentName.toLowerCase().includes(query) ||
        reminder.serialNumber.toLowerCase().includes(query)
      );
    });

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Service Reminders</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage upcoming service reminders and maintenance notifications
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full md:w-[250px] bg-white dark:bg-gray-800"
              />
            </div>
            
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-10 pl-8 pr-4 rounded-md border border-input bg-white dark:bg-gray-800 text-sm ring-offset-background appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="expired">Expired</option>
                <option value="valid">Valid</option>
              </select>
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Service Reminders</CardTitle>
            <CardDescription>
              Equipment requiring service in the next 30 days or overdue for service
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6c8aec] border-r-transparent" />
              </div>
            ) : filteredReminders.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No reminders found with the current filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead>Company</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Next Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reminder Sent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReminders.map(reminder => (
                      <TableRow key={reminder.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">{reminder.companyName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{reminder.equipmentName}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {reminder.serialNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(reminder.nextServiceDate), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(reminder.status)}>
                            {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {reminder.reminderSent ? 
                            <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700">
                              Sent
                            </Badge> : 
                            <Badge variant="outline" className="border-dashed">
                              Not Sent
                            </Badge>
                          }
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendReminder(
                              reminder.id, 
                              reminder.contactEmail, 
                              reminder.equipmentName
                            )}
                            disabled={reminder.reminderSent}
                            style={{ 
                              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                              color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                              border: theme === 'dark' ? '1px solid #333' : '1px solid #e2e8f0'
                            }}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismissReminder(reminder.id)}
                            style={{ 
                              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                              color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                              border: theme === 'dark' ? '1px solid #333' : '1px solid #e2e8f0'
                            }}
                          >
                            <BellOff className="h-4 w-4 mr-2" />
                            Dismiss
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminReminders; 