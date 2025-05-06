import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TestApiPage() {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testCompressorApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token
      const token = localStorage.getItem('equiptrak_token');
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      // Create test payload
      const testPayload = {
        company_id: "test-company-id-123",
        engineer_name: "Test Engineer",
        test_date: "2025-04-25",
        retest_date: "2026-04-24",
        status: "valid",
        compressor_model: "TEST-MODEL-123",
        equipment_name: "TEST-EQUIPMENT-NAME",
        equipment_serial: "TEST-SERIAL-123",
        pressure_test_result: "PASS",
        safety_valve_test: "PASS",
        oil_level: "PASS",
        belt_condition: "PASS",
        filter_check_result: "PASS",
        notes: "Test note"
      };

      console.log("Sending test request:", testPayload);

      // Send request
      const response = await fetch('/api/compressors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testPayload)
      });

      // Get response data
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { text: await response.text() };
      }

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));
      console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || `API error: ${response.status} ${response.statusText}`);
      }

      setApiResponse(responseData);
    } catch (err: any) {
      console.error("API test error:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>API Testing Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testCompressorApi}
              disabled={loading}
            >
              {loading ? "Testing..." : "Test Compressor API"}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <h3 className="text-red-700 font-medium">Error:</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {apiResponse && (
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <h3 className="text-green-700 font-medium">Success:</h3>
              <pre className="bg-white p-2 rounded text-sm overflow-auto max-h-80">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TestApiPage; 