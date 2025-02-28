interface ServiceEngineerInfoProps {
  engineerName: string;
}

export function ServiceEngineerInfo({ engineerName }: ServiceEngineerInfoProps) {
  return (
    <div className="space-y-2 mb-8">
      <label className="text-sm text-muted-foreground">Engineer</label>
      <div className="h-10 px-3 py-2 bg-muted rounded-md text-sm">
        {engineerName}
      </div>
    </div>
  );
}