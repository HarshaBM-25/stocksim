import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  TrendingUp, 
  History, 
  Menu, 
  User, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Wallet } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-border bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-xl font-bold flex items-center">
              <span className="text-primary mr-1 neon-text">Stock</span>
              <span className="text-secondary">X</span>
              <span className="text-accent ml-1">Neon</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <a className={`py-2 text-sm font-medium ${
                location === "/" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}>
                Dashboard
              </a>
            </Link>
            <Link href="/market">
              <a className={`py-2 text-sm font-medium ${
                location === "/market" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}>
                Market
              </a>
            </Link>
            <Link href="/transactions">
              <a className={`py-2 text-sm font-medium ${
                location === "/transactions" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}>
                Transactions
              </a>
            </Link>
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-muted rounded-full px-3 py-1 text-sm">
              <Wallet className="text-primary mr-2 h-4 w-4" />
              <span className="font-mono">₹{user?.balance ? Number(user.balance).toLocaleString('en-IN') : "0"}</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.firstName || "User"} 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-primary">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/90 border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/">
              <a className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                location === "/" ? "text-primary" : "text-muted-foreground"
              }`}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </a>
            </Link>
            <Link href="/market">
              <a className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                location === "/market" ? "text-primary" : "text-muted-foreground"
              }`}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Market
              </a>
            </Link>
            <Link href="/transactions">
              <a className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                location === "/transactions" ? "text-primary" : "text-muted-foreground"
              }`}>
                <History className="mr-2 h-4 w-4" />
                Transactions
              </a>
            </Link>
            <div className="flex items-center px-3 py-2 text-base">
              <Wallet className="text-primary mr-2 h-4 w-4" />
              <span className="font-mono">₹{user?.balance ? Number(user.balance).toLocaleString('en-IN') : "0"}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
