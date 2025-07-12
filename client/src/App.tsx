import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import AdminDatabase from "@/pages/admin-database";
import AdminParser from "@/pages/admin-parser";
import AdminApplications from "@/pages/admin-applications";
import ApplicationDetail from "@/pages/application-detail";
import ManagerDashboard from "@/pages/manager-dashboard";
import ApplicationForm from "@/pages/application-form";
import Catalog from "@/pages/catalog";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/database" component={AdminDatabase} />
          <Route path="/admin/parser" component={AdminParser} />
          <Route path="/admin/applications" component={AdminApplications} />
          <Route path="/manager/dashboard" component={ManagerDashboard} />
          <Route path="/application/:id" component={ApplicationDetail} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/application" component={ApplicationForm} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
