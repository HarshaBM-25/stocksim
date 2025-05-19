import { useEffect } from "react";
import { useLocation, useRouter } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const router = useRouter();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-2xl">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <Card className="glass w-full max-w-md rounded-xl p-8 shadow-xl mb-8">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
              <span className="text-primary mr-2 neon-text">Stock</span>
              <span className="text-secondary">X</span>
              <span className="text-accent ml-2">Neon</span>
            </h1>
            <p className="text-muted-foreground">Virtual trading, real experience</p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleLogin} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 shadow-neon"
            >
              Log in to Continue
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground text-center">
        <p>By signing up, you get ₹1,00,000 in virtual currency to trade with.</p>
      </div>
    </div>
  );
}
