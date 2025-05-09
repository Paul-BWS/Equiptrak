import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function ServiceInspectionDetailsPage() {
  const navigate = useNavigate();
  const [serviceDate, setServiceDate] = useState<Date | undefined>(new Date());
  const [retestDate, setRetestDate] = useState<Date | undefined>(new Date());
  const [loadTestResult, setLoadTestResult] = useState<string>("yes");
  const [outOfAction, setOutOfAction] = useState<string>("no");
  const [observations, setObservations] = useState<string>("No additional notes");
  
  return (
    <div className="max-w-4xl mx-auto py-6 border-0 shadow-none outline-none" style={{ border: 'none', boxShadow: 'none' }}>
      {/* Main Certificate Content */}
      <div className="p-6 border-0 shadow-none outline-none" style={{ border: 'none', boxShadow: 'none' }}>
        {/* Header */}
        <div className="flex items-start space-x-4 mb-6 border-0">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-800 p-2 rounded">
              <img src="/images/bws-logo.png" alt="BWS Logo" width={50} height={50} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Service and Inspection Report</h1>
              <p className="text-sm text-gray-600">The Lifting Operations and Lifting Equipment Regulations 1998 Regulation 9/3</p>
            </div>
          </div>
        </div>
        
        {/* Certificate Number and Status */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b">
          <div>
            <span className="font-medium">Certificate Number:</span>
            <span className="ml-2">BWS-1000</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Status:</span>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 px-4 py-1">
              PASS
            </Badge>
          </div>
        </div>
        
        {/* Customer Section */}
        <div className="mb-6 pb-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Customer</h2>
          <p className="font-medium text-base mb-1">A B L 1 Touch (Bilston)</p>
          <p className="text-gray-800">Unit C Oxford St Ind Est, Bilston, WV14 7LF</p>
        </div>
        
        {/* Test Information */}
        <div className="grid grid-cols-3 gap-4 mb-6 pb-4 border-b">
          <div>
            <h3 className="font-medium mb-1">Test Date</h3>
            <p>09/04/2025</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Retest Date</h3>
            <p>08/04/2026</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Engineer</h3>
            <p>Danny Jennings</p>
          </div>
        </div>
        
        {/* Equipment Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Equipment Details</h2>
          <div className="overflow-hidden">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-x border-t border-gray-200">
                  <td className="font-medium p-3 bg-gray-50 w-1/3">Equipment Type</td>
                  <td className="p-3">scissor_lift</td>
                </tr>
                <tr className="border-b border-x border-gray-200">
                  <td className="font-medium p-3 bg-gray-50">Model</td>
                  <td className="p-3">Autobench</td>
                </tr>
                <tr className="border-b border-x border-gray-200">
                  <td className="font-medium p-3 bg-gray-50">Serial Number</td>
                  <td className="p-3">20230715008</td>
                </tr>
                <tr className="border-b border-x border-gray-200">
                  <td className="font-medium p-3 bg-gray-50">Safe Working Load</td>
                  <td className="p-3">3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Inspection Results */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Inspection Results</h2>
          
          <div className="overflow-hidden mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-x border-t border-gray-200 bg-gray-50">
                  <th className="text-left p-3 font-medium">Test</th>
                  <th className="text-left p-3 font-medium w-1/4">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-x border-gray-200">
                  <td className="p-3">Load Test - tested with a vehicle</td>
                  <td className="p-3 font-medium text-center">YES</td>
                </tr>
                <tr className="border-b border-x border-gray-200">
                  <td className="p-3">Equipment Out of Action</td>
                  <td className="p-3 font-medium text-center">NO</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Observations Section */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Observations / additional comments relative to this thorough examination</h3>
            <div className="border border-gray-200 p-3 mb-4">
              <p>{observations}</p>
            </div>
            
            <p className="text-sm mb-6">
              The above equipment has been thoroughly inspected. To be legally compliant with The
              lifting Operations and Lifting Equipment Regulations 1998 Regulation 9/3 and must be
              thoroughly examined at least every 12 months.
            </p>
          </div>
          
          {/* Signature Section */}
          <div className="flex justify-between items-start pt-4 border-t">
            <div>
              <h3 className="font-medium mb-2">Signature</h3>
              <div className="border border-gray-200 w-24 h-24 flex items-center justify-center">
                <img src="/images/signature.png" alt="Signature" width={50} height={50} />
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">Basic Welding Service LTD</p>
              <p>232 Briscoe lane</p>
              <p>Manchester</p>
              <p>M40 2XG</p>
              <p>0161 223 1843</p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 mt-4 border-t">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <Button type="button" onClick={() => alert("Edit mode not implemented")}>Edit</Button>
          <Button type="button" onClick={() => alert("Print functionality not implemented")}>Print</Button>
        </div>
      </div>
    </div>
  );
} 