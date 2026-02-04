import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, Palette, LogOut, Trash2, X, Check } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useSocket } from '@/contexts/SocketContext';
import { moodThemesOrdered, type MoodTheme } from '@/lib/moodThemes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useApp } from '@/hooks/useApp';
import { chatApi } from '@/services/api';
import { moodThemes } from '@/lib/moodThemes';
import { toast } from '@/hooks/use-toast';

const RoomActions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDarkMode, toggleDarkMode, refreshJoinedRooms } = useApp();
  const [room, setRoom] = useState<{
    id: string;
    title: string;
    description: string;
    icon?: string | null;
    category: string;
    chatTheme: string | null;
    memberCount: number;
    isCreator: boolean;
    membersList: Array<{ id: string; username: string; avatar: string | null; isCreator: boolean }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [kickingUserId, setKickingUserId] = useState<string | null>(null);
  const [showKickConfirm, setShowKickConfirm] = useState(false);
  const [kickTarget, setKickTarget] = useState<{ id: string; name: string } | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [themeApplying, setThemeApplying] = useState(false);
  const { socket, joinChatRoom, leaveChatRoom } = useSocket();

  const loadRoom = () => {
    if (!id) return;
    setLoading(true);
    chatApi
      .getChatRoom(id)
      .then((res) => {
        if (res.success && res.room) {
          setRoom({
            id: res.room.id,
            title: res.room.title,
            description: res.room.description ?? '',
            icon: res.room.icon,
            category: res.room.category,
            chatTheme: res.room.chatTheme ?? 'default',
            memberCount: res.room.memberCount ?? 0,
            isCreator: res.room.isCreator ?? false,
            membersList: (res.room.membersList ?? []).map((m: any) => ({
              id: m.id,
              username: m.username,
              avatar: m.avatar ?? null,
              isCreator: m.isCreator ?? false,
            })),
          });
        } else {
          setRoom(null);
        }
      })
      .catch(() => setRoom(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoom();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    joinChatRoom(id);
    return () => leaveChatRoom(id);
  }, [id, joinChatRoom, leaveChatRoom]);

  useEffect(() => {
    if (!socket || !id) return;
    const onMemberLeft = () => loadRoom();
    socket.on('member:left_room', onMemberLeft);
    socket.on('member:kicked_room', onMemberLeft);
    return () => {
      socket.off('member:left_room', onMemberLeft);
      socket.off('member:kicked_room', onMemberLeft);
    };
  }, [socket, id]);

  const handleLeaveRoom = () => {
    if (!id) return;
    setLeaving(true);
    chatApi.leaveChatRoom(id).then((res) => {
      setLeaving(false);
      setShowLeaveConfirm(false);
      if (res.success) {
        refreshJoinedRooms();
        navigate('/chat-rooms');
      } else {
        toast({ title: 'Failed to leave room', variant: 'destructive' });
      }
    });
  };

  const handleDeleteRoom = () => {
    if (!id) return;
    setDeleting(true);
    chatApi.deleteRoom(id).then((res) => {
      setDeleting(false);
      setShowDeleteConfirm(false);
      if (res.success) {
        refreshJoinedRooms();
        navigate('/chat-rooms');
      } else {
        toast({ title: res.message || 'Failed to delete room', variant: 'destructive' });
      }
    });
  };

  const handleKickMember = (memberId: string, name: string) => {
    setKickTarget({ id: memberId, name });
    setShowKickConfirm(true);
  };

  const confirmKick = () => {
    if (!id || !kickTarget) return;
    setKickingUserId(kickTarget.id);
    chatApi.kickMember(id, kickTarget.id).then((res) => {
      setKickingUserId(null);
      setShowKickConfirm(false);
      setKickTarget(null);
      if (res.success) loadRoom();
      else toast({ title: 'Failed to remove member', variant: 'destructive' });
    });
  };

  const handleApplyRoomTheme = async (theme: MoodTheme) => {
    if (!id || (room?.chatTheme || 'default') === theme.id) return;
    setThemeApplying(true);
    try {
      const res = await chatApi.setRoomTheme(id, theme.id, theme.name);
      if (res.success) setRoom((prev) => (prev ? { ...prev, chatTheme: theme.id } : null));
      setShowThemeModal(false);
    } finally {
      setThemeApplying(false);
    }
  };

  if (loading && !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <Button onClick={() => navigate('/chat-rooms')}>Back to Chat Rooms</Button>
        </div>
      </div>
    );
  }

  const state = location.state as { originalFrom?: string } | null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        title="Room Actions"
        subtitle={room.title}
        showBack={true}
        onBack={() =>
          navigate(`/chat-room/${id}`, {
            replace: true,
            state: { from: state?.originalFrom || 'chat-rooms' },
          })
        }
        showNotifications={false}
        showAIAssistant={false}
      />
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 content-safe-top pb-24 overflow-y-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-muted border-2 border-border flex items-center justify-center mx-auto mb-4 text-3xl">
              {room.icon || '💬'}
            </div>
            <h2 className="text-xl font-bold mb-1">{room.title}</h2>
            <p className="text-sm text-muted-foreground">{room.description || 'No description'}</p>
            <p className="text-xs text-muted-foreground mt-2">{room.memberCount} members</p>
          </CardContent>
        </Card>

        {/* Theme: button opens modal like private chat */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full h-12 flex items-center gap-2 text-pink-600 border-pink-200 hover:bg-pink-50"
              onClick={() => setShowThemeModal(true)}
            >
              <Palette className="w-5 h-5" />
              <span>Mood Themes</span>
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showThemeModal} onOpenChange={setShowThemeModal}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-sm mx-auto max-h-[70vh] overflow-hidden rounded-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-purple-500" />
                Mood Themes
              </DialogTitle>
              <DialogDescription>
                Change the chat background theme for this room. All members will see the same theme.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(70vh-120px)] space-y-4">
              {moodThemesOrdered.map((theme) => {
                const isSelected = (room?.chatTheme || 'default') === theme.id;
                return (
                  <Card key={theme.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{theme.emoji}</span>
                          <span className="font-medium">{theme.name}</span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleApplyRoomTheme(theme)}
                        disabled={isSelected || themeApplying}
                      >
                        {isSelected ? 'Current theme' : 'Apply theme'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users size={20} />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {room.membersList.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0"
              >
                <Button
                  variant="ghost"
                  className="flex-1 justify-start gap-2"
                  onClick={() => navigate(`/profile/${member.id}`)}
                >
                  <span className="text-lg">{member.avatar || '👤'}</span>
                  <span className="truncate">{member.username}</span>
                  {member.isCreator && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Creator</span>
                  )}
                </Button>
                {room.isCreator && !member.isCreator && member.id !== user?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0"
                    onClick={() => handleKickMember(member.id, member.username)}
                    disabled={kickingUserId === member.id}
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setShowLeaveConfirm(true)}
              disabled={leaving}
            >
              <LogOut size={16} className="mr-2" />
              Leave room
            </Button>
          </CardContent>
        </Card>

        {room.isCreator && (
          <Card className="border-destructive/30">
            <CardContent className="pt-6">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
              >
                <Trash2 size={16} className="mr-2" />
                Delete chat room
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Permanently deletes this room and all its messages. This cannot be undone.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this room?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be removed from the room and your message history for this room will be cleared. You can join again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveRoom} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat room?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the room and all messages. All members will be removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showKickConfirm} onOpenChange={setShowKickConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {kickTarget?.name} will be removed from the room. Their message history for this room will be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setKickTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmKick} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomActions;
