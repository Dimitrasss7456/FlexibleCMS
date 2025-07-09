import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import QuickApplicationForm from "@/components/quick-application-form";
import UserTypeSelection from "@/components/user-type-selection";
import FeaturesSection from "@/components/features-section";
import Footer from "@/components/footer";

export default function Landing() {
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
