import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Messages from "./pages/Messages";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegister from "./pages/AdminRegister";
import Roommates from "./pages/Roommates";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import ApplyToListing from "./pages/ApplyToListing";
import LandlordApplications from "./pages/LandlordApplications";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/roommates" element={<Roommates />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/listings/:id/apply" element={<ApplyToListing />} />
          <Route path="/applications" element={<LandlordApplications />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
