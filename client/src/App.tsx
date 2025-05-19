import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Market from "@/pages/Market";
import Transactions from "@/pages/Transactions";
import Login from "@/pages/Login";
import BaseLayout from "@/layouts/BaseLayout";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/">
            <BaseLayout>
              <Dashboard />
            </BaseLayout>
          </Route>
          <Route path="/market">
            <BaseLayout>
              <Market />
            </BaseLayout>
          </Route>
          <Route path="/transactions">
            <BaseLayout>
              <Transactions />
            </BaseLayout>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
