export function CustomerInfo({ companyName, showCustomer = true }) {
  if (!showCustomer) return null;
  
  return (
    <div className="flex items-center space-x-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">
        {companyName || "Unknown Company"}
      </span>
    </div>
  );
} 