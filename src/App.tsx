import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { LanguageAIProvider } from "@/contexts/LanguageAIContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CallProvider } from "@/contexts/CallContext";
import AuthGuard from "@/components/auth/AuthGuard";
import PublicGuard from "@/components/auth/PublicGuard";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import PWAErrorBoundary from "@/components/PWAErrorBoundary";
import { UpdateNotification } from "@/components/UpdateNotification";

// Pages
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatRooms from "./pages/ChatRooms";
import ChatRoom from "./pages/ChatRoom";
import Match from "./pages/Match";
import ChatInbox from "./pages/ChatInbox";
import PrivateChat from "./pages/PrivateChat";
import Forum from "./pages/Forum";
import ForumThread from "./pages/ForumThread";
import Events from "./pages/Events";
import Event from "./pages/Event";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import MyEvents from "./pages/MyEvents";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import ProfileStats from "./pages/ProfileStats";
import Settings from "./pages/Settings";
import CallHistory from "./pages/CallHistory";
import ArchivedChats from "./pages/ArchivedChats";
import MessagesSettings from "./pages/MessagesSettings";
import SafetyCenter from "./components/security/SafetyCenter";
import NotFound from "./pages/NotFound";
import NotificationsCommunication from "./pages/NotificationsCommunication";
import AppearanceExperience from "./pages/AppearanceExperience";
import DeviceData from "./pages/DeviceData";
import UserProfileActions from "./pages/UserProfileActions";
import RoomActions from "./pages/RoomActions";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initialization time and ensure all providers are ready
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Driftzo...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PWAErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <NotificationProvider>
              <LanguageAIProvider>
                <CallProvider>
                  <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true,
                    }}
                  >
                    <ScrollToTop />
                    <UpdateNotification />
              <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={
              <PublicGuard>
                <Login />
              </PublicGuard>
            } />
            <Route path="/register" element={
              <PublicGuard>
                <Register />
              </PublicGuard>
            } />
            
            {/* Protected Routes */}
            <Route path="/community" element={
              <AuthGuard>
                <Community />
              </AuthGuard>
            } />
            <Route path="/chat-rooms" element={
              <AuthGuard>
                <ChatRooms />
              </AuthGuard>
            } />
            <Route path="/chat-room/:id" element={
              <AuthGuard>
                <ChatRoom />
              </AuthGuard>
            } />
            <Route path="/match" element={
              <AuthGuard>
                <Match />
              </AuthGuard>
            } />

            <Route path="/chat-inbox" element={
              <AuthGuard>
                <ChatInbox />
              </AuthGuard>
            } />
            <Route path="/private-chat/:userId" element={
              <AuthGuard>
                <PrivateChat />
              </AuthGuard>
            } />
            <Route path="/user-actions/:userId" element={
              <AuthGuard>
                <UserProfileActions />
              </AuthGuard>
            } />
            <Route path="/room-actions/:id" element={
              <AuthGuard>
                <RoomActions />
              </AuthGuard>
            } />
            <Route path="/forum" element={
              <AuthGuard>
                <Forum />
              </AuthGuard>
            } />
            <Route path="/forum/thread/:id" element={
              <AuthGuard>
                <ForumThread />
              </AuthGuard>
            } />
                    <Route path="/events" element={
          <AuthGuard>
            <Events />
          </AuthGuard>
        } />
        <Route path="/event/:id" element={
          <AuthGuard>
            <Event />
          </AuthGuard>
        } />
        <Route path="/create-event" element={
          <AuthGuard>
            <CreateEvent />
          </AuthGuard>
        } />
        <Route path="/edit-event/:eventId" element={
          <AuthGuard>
            <EditEvent />
          </AuthGuard>
        } />
        <Route path="/my-events" element={
          <AuthGuard>
            <MyEvents />
          </AuthGuard>
        } />
            <Route path="/profile" element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            } />
            <Route path="/profile/:userId" element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            } />
            <Route path="/profile/edit" element={
              <AuthGuard>
                <ProfileEdit />
              </AuthGuard>
            } />
            <Route path="/profile/stats" element={
              <AuthGuard>
                <ProfileStats />
              </AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard>
                <Settings />
              </AuthGuard>
            } />
            <Route path="/call-history" element={
              <AuthGuard>
                <CallHistory />
              </AuthGuard>
            } />
            <Route path="/archived-chats" element={
              <AuthGuard>
                <ArchivedChats />
              </AuthGuard>
            } />
            <Route path="/messages-settings" element={
              <AuthGuard>
                <MessagesSettings />
              </AuthGuard>
            } />
            <Route path="/safety-center" element={<AuthGuard><SafetyCenter /></AuthGuard>} />
            <Route path="/notifications-communication" element={<AuthGuard><NotificationsCommunication /></AuthGuard>} />
            <Route path="/appearance-experience" element={<AuthGuard><AppearanceExperience /></AuthGuard>} />
            <Route path="/device-data" element={<AuthGuard><DeviceData /></AuthGuard>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
                </BrowserRouter>
                  </TooltipProvider>
                </CallProvider>
              </LanguageAIProvider>
            </NotificationProvider>
          </AppProvider>
        </QueryClientProvider>
      </PWAErrorBoundary>
    </ErrorBoundary>
  );
};

export default App;
