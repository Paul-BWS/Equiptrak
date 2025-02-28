import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddServiceButton } from "./AddServiceButton";

export function ReplaceAddCertificateButton() {
  // This component is meant to be a drop-in replacement for the "Add Certificate" button
  // Find the "Add Certificate" button in your code and replace it with this component
  
  return (
    <Button 
      onClick={() => {
        // Find all buttons with text "Add Certificate"
        const buttons = Array.from(document.querySelectorAll('button')).filter(
          button => button.textContent?.includes('Add Certificate')
        );
        
        // If found, click it to open the existing modal
        if (buttons.length > 0) {
          buttons[0].click();
          
          // Then find the modal and replace its content
          setTimeout(() => {
            const modal = document.querySelector('[role="dialog"]');
            if (modal) {
              // Replace the modal title
              const title = modal.querySelector('h2');
              if (title) title.textContent = "Add Service Record";
              
              // Add equipment fields
              // This is a hacky approach but might work as a temporary solution
              const form = modal.querySelector('form');
              if (form) {
                const equipmentSection = document.createElement('div');
                equipmentSection.innerHTML = `
                  <h3 class="font-medium mt-4">Equipment Details</h3>
                  <div class="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label class="text-sm font-medium">Equipment 1</label>
                      <input type="text" class="w-full mt-1 px-3 py-2 border rounded-md" placeholder="Enter equipment name">
                    </div>
                    <div>
                      <label class="text-sm font-medium">Serial Number</label>
                      <input type="text" class="w-full mt-1 px-3 py-2 border rounded-md" placeholder="Enter serial number">
                    </div>
                  </div>
                `;
                form.appendChild(equipmentSection);
              }
            }
          }, 100);
        }
      }}
      className="bg-[#7b96d4] hover:bg-[#6a85c3] text-white gap-2"
    >
      <Plus className="h-4 w-4" />
      Add Service
    </Button>
  );
} 