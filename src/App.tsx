import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { LanguageAIProvider } from "@/contexts/LanguageAIContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import AuthGuard from "@/components/auth/AuthGuard";
import PublicGuard from "@/components/auth/PublicGuard";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatRooms from "./pages/ChatRooms";
import ChatRoom from "./pages/ChatRoom";
import Match from "./pages/Match";
import Matches from "./pages/Matches";
import ChatInbox from "./pages/ChatInbox";
import PrivateChat from "./pages/PrivateChat";
import Forum from "./pages/Forum";
import ForumThread from "./pages/ForumThread";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import ProfileStats from "./pages/ProfileStats";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <NotificationProvider>
          <LanguageAIProvider>
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
            <Route path="/matches" element={
              <AuthGuard>
                <Matches />
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
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </LanguageAIProvider>
      </NotificationProvider>
    </AppProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
