import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Save, X } from 'lucide-react';

interface SignatureCaptureProps {
  entityType: string;  // e.g., 'work_order', 'service_report'
  entityId: string;
  onComplete: (signatureUrl: string) => void;
  onCancel?: () => void;
}

export default function SignatureCapture({ 
  entityType, 
  entityId, 
  onComplete,
  onCancel
}: SignatureCaptureProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };
  
  const handleCancel = () => {
    handleClear();
    if (onCancel) {
      onCancel();
    }
  };
  
  const handleSave = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      toast({
        title: "Signature required",
        description: "Please provide a signature before saving",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Convert the signature to a base64 data URL
      const signatureData = sigCanvas.current.toDataURL('image/png');
      
      // Send to the server
      const response = await fetch('/api/images/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          signatureData,
          entityType,
          entityId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save signature');
      }
      
      const data = await response.json();
      
      toast({
        title: "Signature saved",
        description: "Your signature has been recorded"
      });
      
      // Call the completion callback with the signature URL
      onComplete(data.url);
      
      // Clear the canvas
      handleClear();
    } catch (error) {
      console.error('Error saving signature:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not save signature",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="text-lg font-medium mb-2">Signature</div>
      <p className="text-sm text-muted-foreground mb-4">
        Please sign using your finger or stylus
      </p>
      
      <div className="border-2 border-dashed border-gray-300 rounded-md bg-white mb-4">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-48', 
            style: { 
              touchAction: 'none',
              width: '100%',
              height: '100%'
            }
          }}
          backgroundColor="white"
        />
      </div>
      
      <div className="flex justify-between">
        <div>
          <Button 
            variant="outline" 
            onClick={handleClear} 
            className="mr-2"
            type="button"
          >
            Clear
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            type="button"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-a6e15a text-black hover:bg-opacity-90"
          type="button"
        >
          {isSaving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            <span className="flex items-center">
              <Save className="h-4 w-4 mr-1" />
              Save Signature
            </span>
          )}
        </Button>
      </div>
    </div>
  );
} 