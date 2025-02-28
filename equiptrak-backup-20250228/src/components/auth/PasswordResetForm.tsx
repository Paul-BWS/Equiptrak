import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PasswordResetFormProps {
  onBack: () => void;
}

export const PasswordResetForm = ({ onBack }: PasswordResetFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://equiptrack.basicwelding.co.uk/reset-password`,
      });
      if (error) throw error;
      toast.success("Check your email for password reset instructions!");
      onBack();
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error("Failed to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-white text-lg">Email</label>
        <Input
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#111315] border-none text-gray-300 placeholder-gray-500"
          disabled={isLoading}
        />
      </div>

      <Button 
        type="submit"
        className="w-full bg-[#C1FF5C] text-black hover:bg-[#B1EF4C] text-lg py-6"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send Reset Instructions"}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          className="text-[#C1FF5C] hover:text-[#B1EF4C] text-lg"
          onClick={onBack}
          disabled={isLoading}
        >
          Back to Sign In
        </Button>
      </div>
    </form>
  );
};