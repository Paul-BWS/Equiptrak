import { ClipboardCheck, Trash2, /* other icons */ } from "lucide-react";

// Then in your component where the edit button is rendered:
<Button 
  variant="outline" 
  size="icon"
  onClick={() => {/* your edit function */}}
>
  <ClipboardCheck className="h-4 w-4" />
  <span className="sr-only">Edit</span>
</Button> 