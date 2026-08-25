import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturedSection from './components/FeaturedSection';
import StatsSection from './components/StatsSection';
import DestinationsSection from './components/DestinationsSection';
import CategoriesSection from './components/CategoriesSection';
import MapSection from './components/MapSection';
import HotelsSection from './components/HotelsSection';
import RestaurantsSection from './components/RestaurantsSection';
import CafesSection from './components/CafesSection';
import CarRentalSection from './components/CarRentalSection';
import CarOwnerDashboard from './components/CarOwnerDashboard';
import GuestDashboard from './components/GuestDashboard';
import FooterSection from './components/FooterSection';
import ChatWidget from './components/ChatWidget';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import ErrorBoundary, { CrashFallback } from "./components/ErrorBoundary";
import SafetyTripPage from './pages/SafetyTripPage';
import ConnectionStatusIndicator from './components/ConnectionStatusIndicator';
import LocalAuthDialog from './components/LocalAuthDialog';
import UnifiedDiscoverySearch from './components/UnifiedDiscoverySearch';
import VisitorPlanningPage from './pages/VisitorPlanningPage';
import { useAuth } from '@/_core/hooks/useAuth';

function AuthenticatedDashboards() {
  const { user, loading } = useAuth();
  if (loading || !user) return null;
  return <><CarOwnerDashboard /><GuestDashboard /></>;
}

function App() {
  const currentPath = window.location.pathname;
  const isSafetyTripPage = currentPath === '/safety-trip';
  const isVisitorPlanningPage = currentPath === '/visitor-planning';

  if (isSafetyTripPage || isVisitorPlanningPage) {
    return (
      <ErrorBoundary fallbackRender={({ error }) => <CrashFallback message={error?.message} />}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <ConnectionStatusIndicator />
            <LocalAuthDialog />
            {isSafetyTripPage ? <SafetyTripPage /> : <VisitorPlanningPage />}
          </TooltipProvider>
        </LanguageProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <CrashFallback message={error?.message} />}
    >
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <LocalAuthDialog />
          <div className="min-h-screen bg-[#f5f5f0]">
            <Navbar />
            <ConnectionStatusIndicator />
            <main>
              <HeroSection />
              <UnifiedDiscoverySearch />
              <FeaturedSection />
              <StatsSection />
              <DestinationsSection />
              <CategoriesSection />
              <HotelsSection />
              <RestaurantsSection />
              <CafesSection />
              <CarRentalSection />
              <AuthenticatedDashboards />
              <MapSection />
              <FooterSection />
            </main>
            <ChatWidget />
          </div>
        </TooltipProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
