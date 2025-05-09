import { Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LogoUploaderProps {
  logoUrl?: string;
  companyId?: string;
  size?: 'sm' | 'md' | 'lg';
  onUploadComplete?: (url: string) => void;
  inline?: boolean;
}

export default function LogoUploader({
  logoUrl,
  companyId,
  size = 'sm',
  onUploadComplete,
  inline = false
}: LogoUploaderProps) {
  const { toast } = useToast();

  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const handleClick = () => {
    toast({
      title: "Feature Disabled",
      description: "Logo uploading is temporarily disabled.",
    });
  };

  // Generate a unique placeholder based on company name or ID
  const getPlaceholderLogo = () => {
    // Get first letter from company ID or use a default
    const letter = companyId ? companyId.charAt(0).toUpperCase() : 'C';
    // Generate a deterministic color based on companyId
    const color = companyId ? 
      `#${(companyId.split('').map(c => c.charCodeAt(0)).reduce((a, b) => a + b, 0) % 0xFFFFFF).toString(16).padStart(6, '0')}` : 
      '#a6e15a';
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill={color} />
        <text 
          x="50" 
          y="50" 
          fontFamily="Arial" 
          fontSize="40" 
          fill="#FFFFFF" 
          textAnchor="middle" 
          dominantBaseline="middle"
        >
          {letter}
        </text>
      </svg>
    );
  };

  return (
    <div className={`flex ${inline ? 'flex-row' : 'flex-col'} items-center`}>
      <div 
        className={`relative flex items-center justify-center border border-gray-200 rounded-md bg-gray-50 ${sizeClasses[size]}`}
      >
        {getPlaceholderLogo()}
      </div>
      <div className={`${inline ? 'ml-2' : 'mt-2'} flex flex-col items-center`}>
        <Button 
          size="sm"
          variant="outline"
          onClick={handleClick}
          className="text-xs py-1 px-2 h-auto"
        >
          Upload Logo
        </Button>
      </div>
    </div>
  );
} 