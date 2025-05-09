import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1D1F] px-4">
      <div className="w-full max-w-md space-y-8 bg-[#1E2023] rounded-2xl p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create Account
          </h1>
          <p className="text-sm text-gray-400">
            Sign up to get started with your account
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#111315] border-none text-gray-300 placeholder-gray-500 h-12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#111315] border-none text-gray-300 placeholder-gray-500 h-12"
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-[#C1FF5C] text-black hover:bg-[#B1EF4C] font-medium h-12"
          >
            Sign Up
          </Button>
        </form>

        <div className="text-center">
          <a 
            href="/login" 
            className="text-sm text-[#C1FF5C] hover:text-[#B1EF4C]"
          >
            Already have an account? Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;