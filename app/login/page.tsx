"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function Login() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAdminAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(password);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to JustiGuide Dashboard",
        });

        // Navigate to dashboard
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 100);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid password. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-chalk flex items-center justify-center p-4 font-body">
      <Card className="w-full max-w-md bg-white border-2 border-border shadow-[0_4px_24px_rgba(0,0,0,0.08),0_12px_48px_rgba(107,95,207,0.12)]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-4 bg-accent/10 rounded-full w-fit ring-2 ring-accent/20">
            <Shield className="h-10 w-10 text-accent" />
          </div>
          <CardTitle className="text-2xl font-display text-ink">JustiGuide Admin</CardTitle>
          <p className="text-base text-ink/80 mt-2 font-medium">
            Enter password to access dashboard
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
                className="border-2 border-border focus:border-accent text-ink placeholder:text-warm-gray"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent-deep text-white font-bold py-6 text-base"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ink/70 font-medium">
              Customer services available at{" "}
              <a href="/" className="text-accent font-semibold hover:underline">
                home page
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
