import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { 
  Shield, 
  UserX, 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Camera, 
  Mic, 
  Clock, 
  Smartphone, 
  Monitor, 
  Zap, 
  Timer,
  Heart,
  MessageSquare,
  Globe,
  Bell,
  Settings,
  HelpCircle,
  BookOpen,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
  blockedAt: Date;
  reason: string;
  canUnblock: boolean;
}

interface SafetyReport {
  id: string;
  reportedUser: string;
  category: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  submittedAt: Date;
  urgency: 'low' | 'medium' | 'high';
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isTrusted: boolean;
}

interface SafetySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  locationSharing: boolean;
  screenshotProtection: boolean;
  incognitoMode: boolean;
  emergencyAlerts: boolean;
  autoBlockKeywords: string[];
  safeMode: 'light' | 'deep' | 'learning';
  analyticsOptIn: boolean;
  dataCollection: boolean;
}

const SafetyCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
    {
      id: '1',
      name: 'John Doe',
      avatar: '👤',
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      reason: 'Inappropriate behavior',
      canUnblock: true
    },
    {
      id: '2',
      name: 'Jane Smith',
      avatar: '👩',
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      reason: 'Spam messages',
      canUnblock: true
    }
  ]);

  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([
    {
      id: '1',
      reportedUser: 'John Doe',
      category: 'Harassment',
      status: 'resolved',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      urgency: 'high'
    },
    {
      id: '2',
      reportedUser: 'Jane Smith',
      category: 'Spam',
      status: 'reviewing',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      urgency: 'medium'
    }
  ]);

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      relationship: 'Best Friend',
      phone: '+1 (555) 123-4567',
      email: 'sarah@email.com',
      isTrusted: true
    },
    {
      id: '2',
      name: 'Mike Wilson',
      relationship: 'Brother',
      phone: '+1 (555) 987-6543',
      isTrusted: true
    }
  ]);

  const [safetySettings, setSafetySettings] = useState<SafetySettings>({
    profileVisibility: 'public',
    locationSharing: false,
    screenshotProtection: true,
    incognitoMode: false,
    emergencyAlerts: true,
    autoBlockKeywords: ['spam', 'inappropriate'],
    safeMode: 'light',
    analyticsOptIn: false,
    dataCollection: false
  });

  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: ''
  });

  const [newKeyword, setNewKeyword] = useState('');

  const handleUnblockUser = (userId: string) => {
    setBlockedUsers(prev => prev.filter(user => user.id !== userId));
    // In real app, this would call an API
  };

  const handleAddEmergencyContact = () => {
    if (!newContact.name || !newContact.phone) return;

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      relationship: newContact.relationship,
      phone: newContact.phone,
      email: newContact.email,
      isTrusted: true
    };

    setEmergencyContacts(prev => [...prev, contact]);
    setNewContact({ name: '', relationship: '', phone: '', email: '' });
  };

  const handleRemoveEmergencyContact = (contactId: string) => {
    setEmergencyContacts(prev => prev.filter(contact => contact.id !== contactId));
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    setSafetySettings(prev => ({
      ...prev,
      autoBlockKeywords: [...prev.autoBlockKeywords, newKeyword.toLowerCase()]
    }));
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSafetySettings(prev => ({
      ...prev,
      autoBlockKeywords: prev.autoBlockKeywords.filter(k => k !== keyword)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            {/* Safety Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="text-center p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                <UserX className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-red-600">{blockedUsers.length}</div>
                <div className="text-xs text-red-600">Blocked</div>
              </Card>
              <Card className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <Flag className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-blue-600">{safetyReports.length}</div>
                <div className="text-xs text-blue-600">Reports</div>
              </Card>
              <Card className="text-center p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-600">{emergencyContacts.length}</div>
                <div className="text-xs text-green-600">Contacts</div>
              </Card>
              <Card className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-purple-600">Active</div>
                <div className="text-xs text-purple-600">Protection</div>
              </Card>
            </div>

            {/* Safety Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Meet in Public</h4>
                    <p className="text-xs text-muted-foreground">Always meet new people in public places first</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Trust Your Instincts</h4>
                    <p className="text-xs text-muted-foreground">If something feels wrong, it probably is</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Keep Personal Info Private</h4>
                    <p className="text-xs text-muted-foreground">Don't share sensitive information too quickly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'blocked':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserX className="h-4 w-4 text-red-600" />
                  Blocked Users ({blockedUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {blockedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="font-semibold mb-2">No Blocked Users</h3>
                    <p className="text-sm text-muted-foreground">You haven't blocked anyone yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockedUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{user.avatar}</div>
                          <div>
                            <h4 className="font-medium text-sm">{user.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Blocked {user.blockedAt.toLocaleDateString()} • {user.reason}
                            </p>
                          </div>
                        </div>
                        {user.canUnblock && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblockUser(user.id)}
                          >
                            Unblock
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Flag className="h-4 w-4 text-blue-600" />
                  Safety Reports ({safetyReports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safetyReports.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="font-semibold mb-2">No Reports</h3>
                    <p className="text-sm text-muted-foreground">You haven't submitted any safety reports</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {safetyReports.map(report => (
                      <div key={report.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">Reported: {report.reportedUser}</h4>
                          <div className="flex gap-2">
                            <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                              {report.status}
                            </Badge>
                            <Badge className={`text-xs ${getUrgencyColor(report.urgency)}`}>
                              {report.urgency}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Category: {report.category}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {report.submittedAt.toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-green-600" />
                  Emergency Contacts ({emergencyContacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Contact */}
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3 text-sm">Add New Emergency Contact</h4>
                  <div className="space-y-3">
                    <Input
                      placeholder="Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Relationship"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Email (optional)"
                      value={newContact.email}
                      onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <Button 
                    onClick={handleAddEmergencyContact}
                    disabled={!newContact.name || !newContact.phone}
                    className="mt-3 w-full"
                    size="sm"
                  >
                    Add Contact
                  </Button>
                </div>

                {/* Existing Contacts */}
                <div className="space-y-3">
                  {emergencyContacts.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">👤</div>
                        <div>
                          <h4 className="font-medium text-sm">{contact.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {contact.relationship} • {contact.phone}
                            {contact.email && ` • ${contact.email}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEmergencyContact(contact.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4 text-purple-600" />
                  Safety Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Safe Mode Settings */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Safe Mode</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Light Mode</Label>
                        <p className="text-xs text-muted-foreground">Standard conversation mode</p>
                      </div>
                      <Switch 
                        checked={safetySettings.safeMode === 'light'} 
                        onCheckedChange={() => setSafetySettings(prev => ({ ...prev, safeMode: 'light' }))} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Deep Mode</Label>
                        <p className="text-xs text-muted-foreground">More meaningful conversations</p>
                      </div>
                      <Switch 
                        checked={safetySettings.safeMode === 'deep'} 
                        onCheckedChange={() => setSafetySettings(prev => ({ ...prev, safeMode: 'deep' }))} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Learning Mode</Label>
                        <p className="text-xs text-muted-foreground">Educational and practice conversations</p>
                      </div>
                      <Switch 
                        checked={safetySettings.safeMode === 'learning'} 
                        onCheckedChange={() => setSafetySettings(prev => ({ ...prev, safeMode: 'learning' }))} 
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Privacy & Data */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Privacy & Data</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Analytics & Insights</Label>
                        <p className="text-xs text-muted-foreground">Help improve Driftzo with usage data</p>
                      </div>
                      <Switch
                        checked={safetySettings.analyticsOptIn}
                        onCheckedChange={(checked) => 
                          setSafetySettings(prev => ({ ...prev, analyticsOptIn: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Data Collection</Label>
                        <p className="text-xs text-muted-foreground">Collect data for personalized experience</p>
                      </div>
                      <Switch
                        checked={safetySettings.dataCollection}
                        onCheckedChange={(checked) => 
                          setSafetySettings(prev => ({ ...prev, dataCollection: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Privacy Settings */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Privacy & Visibility</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showOnlineStatus" className="text-sm">Show Online Status</Label>
                      <Switch
                        id="showOnlineStatus"
                        checked={true}
                        onCheckedChange={() => {}}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showLastSeen" className="text-sm">Show Last Seen</Label>
                      <Switch
                        id="showLastSeen"
                        checked={true}
                        onCheckedChange={() => {}}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showInSearch" className="text-sm">Show in Search</Label>
                      <Switch
                        id="showInSearch"
                        checked={true}
                        onCheckedChange={() => {}}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="profileVisibility" className="text-sm">Profile Visibility</Label>
                      <Select 
                        value={safetySettings.profileVisibility} 
                        onValueChange={(value: 'public' | 'friends' | 'private') => 
                          setSafetySettings(prev => ({ ...prev, profileVisibility: value }))
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="locationSharing" className="text-sm">Location Sharing</Label>
                      <Switch
                        id="locationSharing"
                        checked={safetySettings.locationSharing}
                        onCheckedChange={(checked) => 
                          setSafetySettings(prev => ({ ...prev, locationSharing: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowDirectMessages" className="text-sm">Allow Direct Messages</Label>
                      <Switch
                        id="allowDirectMessages"
                        checked={safetySettings.allowDirectMessages}
                        onCheckedChange={(checked) => 
                          setSafetySettings(prev => ({ ...prev, allowDirectMessages: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Protection Settings */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Protection Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="screenshotProtection" className="text-sm">Screenshot Protection</Label>
                      <Switch
                        id="screenshotProtection"
                        checked={safetySettings.screenshotProtection}
                        onCheckedChange={(checked) => 
                          setSafetySettings(prev => ({ ...prev, screenshotProtection: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="incognitoMode" className="text-sm">Incognito Mode</Label>
                      <Switch
                        id="incognitoMode"
                        checked={safetySettings.incognitoMode}
                        onCheckedChange={(checked) => 
                          setSafetySettings(prev => ({ ...prev, incognitoMode: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="emergencyAlerts" className="text-sm">Emergency Alerts</Label>
                      <Switch
                        id="emergencyAlerts"
                        checked={safetySettings.emergencyAlerts}
                        onCheckedChange={(checked) => 
                          setSafetySettings(prev => ({ ...prev, emergencyAlerts: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Auto-Block Keywords */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Auto-Block Keywords</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add keyword to auto-block"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        className="text-sm flex-1"
                      />
                      <Button onClick={handleAddKeyword} disabled={!newKeyword.trim()} size="sm">
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {safetySettings.autoBlockKeywords.map(keyword => (
                        <Badge key={keyword} variant="secondary" className="flex items-center gap-1 text-xs">
                          {keyword}
                          <button
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="ml-1 hover:text-red-600"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <TopBar 
        title="Safety Center" 
        showBack={true}
        onBack={() => navigate('/settings')}
      />

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-6 content-safe-top pb-24">
        {/* Tab Navigation - Mobile First */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 text-xs h-12"
          >
            <Shield className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'blocked' ? 'default' : 'outline'}
            onClick={() => setActiveTab('blocked')}
            className="flex items-center gap-2 text-xs h-12"
          >
            <UserX className="h-4 w-4" />
            Blocked
          </Button>
          <Button
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 text-xs h-12"
          >
            <Flag className="h-4 w-4" />
            Reports
          </Button>
          <Button
            variant={activeTab === 'contacts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('contacts')}
            className="flex items-center gap-2 text-xs h-12"
          >
            <Users className="h-4 w-4" />
            Contacts
          </Button>
        </div>

        {/* Settings Button - Full Width */}
        <Button
          variant={activeTab === 'settings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('settings')}
          className="w-full flex items-center gap-2 text-sm h-12"
        >
          <Settings className="h-4 w-4" />
          Safety Settings
        </Button>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default SafetyCenter;
