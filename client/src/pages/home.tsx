import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import QuickApplicationForm from "@/components/quick-application-form";
import UserTypeSelection from "@/components/user-type-selection";
import FeaturesSection from "@/components/features-section";
import Footer from "@/components/footer";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Необходима авторизация",
        description: "Войдите в систему для продолжения работы",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection />
      <QuickApplicationForm />
      <UserTypeSelection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
