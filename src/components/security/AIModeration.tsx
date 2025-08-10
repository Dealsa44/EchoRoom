import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Bot, 
  Brain,
  TrendingUp,
  Users,
  MessageSquare,
  Flag,
  Settings,
  Zap,
  Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ModerationRule {
  id: string;
  name: string;
  description: string;
  category: 'harassment' | 'spam' | 'inappropriate' | 'safety' | 'language';
  severity: 'low' | 'medium' | 'high';
  enabled: boolean;
  confidence: number;
}

interface ModerationAction {
  id: string;
  type: 'warning' | 'mute' | 'kick' | 'ban' | 'content_filter';
  timestamp: Date;
  userId: string;
  username: string;
  reason: string;
  content: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
}

interface ModerationStats {
  totalActions: number;
  todayActions: number;
  accuracy: number;
  falsePositives: number;
  contentFiltered: number;
  usersWarned: number;
  usersBanned: number;
}

const AIModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [moderationLevel, setModerationLevel] = useState<'strict' | 'moderate' | 'relaxed'>('moderate');

  const [rules, setRules] = useState<ModerationRule[]>([
    {
      id: '1',
      name: 'Harassment Detection',
      description: 'Detect bullying, personal attacks, and harassment',
      category: 'harassment',
      severity: 'high',
      enabled: true,
      confidence: 92
    },
    {
      id: '2',
      name: 'Spam Filter',
      description: 'Block repetitive messages and promotional content',
      category: 'spam',
      severity: 'medium',
      enabled: true,
      confidence: 88
    },
    {
      id: '3',
      name: 'Inappropriate Content',
      description: 'Filter explicit or inappropriate material',
      category: 'inappropriate',
      severity: 'high',
      enabled: true,
      confidence: 95
    },
    {
      id: '4',
      name: 'Safety Violations',
      description: 'Detect threats, self-harm, and dangerous content',
      category: 'safety',
      severity: 'high',
      enabled: true,
      confidence: 97
    },
    {
      id: '5',
      name: 'Language Profanity',
      description: 'Filter strong language and profanity',
      category: 'language',
      severity: 'low',
      enabled: moderationLevel === 'strict',
      confidence: 85
    }
  ]);

  const [actions, setActions] = useState<ModerationAction[]>([
    {
      id: '1',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      userId: 'user123',
      username: 'TestUser',
      reason: 'Inappropriate language detected',
      content: 'This is some inappropriate content...',
      confidence: 89,
      status: 'approved',
      reviewedBy: 'AutoMod'
    },
    {
      id: '2',
      type: 'content_filter',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      userId: 'user456',
      username: 'SpamBot',
      reason: 'Spam detection - repetitive messaging',
      content: 'Buy now! Limited time offer! Click here!',
      confidence: 96,
      status: 'approved',
      reviewedBy: 'AutoMod'
    },
    {
      id: '3',
      type: 'mute',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      userId: 'user789',
      username: 'TrollUser',
      reason: 'Harassment and personal attacks',
      content: 'Personal attack content...',
      confidence: 94,
      status: 'pending'
    }
  ]);

  const stats: ModerationStats = {
    totalActions: actions.length + 47,
    todayActions: 12,
    accuracy: 94,
    falsePositives: 3,
    contentFiltered: 23,
    usersWarned: 8,
    usersBanned: 2
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    
    // Moderation rule updated - toast removed per user request
  };

  const reviewAction = (actionId: string, approved: boolean) => {
    setActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, status: approved ? 'approved' : 'rejected', reviewedBy: 'Human Moderator' }
        : action
    ));

    // Action approved/rejected - toast removed per user request
  };

  const getModerationLevelColor = (level: string) => {
    switch (level) {
      case 'strict': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'relaxed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'harassment': return <Users size={16} />;
      case 'spam': return <Filter size={16} />;
      case 'inappropriate': return <Eye size={16} />;
      case 'safety': return <Shield size={16} />;
      case 'language': return <MessageSquare size={16} />;
      default: return <Bot size={16} />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'mute': return <XCircle size={16} className="text-orange-500" />;
      case 'kick': return <XCircle size={16} className="text-red-500" />;
      case 'ban': return <Shield size={16} className="text-red-600" />;
      case 'content_filter': return <Filter size={16} className="text-blue-500" />;
      default: return <Bot size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="text-purple-600" />
            AI Moderation
          </h2>
          <p className="text-muted-foreground">Automated content moderation and safety</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getModerationLevelColor(moderationLevel)}>
            {moderationLevel.charAt(0).toUpperCase() + moderationLevel.slice(1)} Mode
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.todayActions}</p>
                    <p className="text-sm text-muted-foreground">Actions Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.accuracy}%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Filter size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.contentFiltered}</p>
                    <p className="text-sm text-muted-foreground">Filtered</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle size={24} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.falsePositives}</p>
                    <p className="text-sm text-muted-foreground">False Positives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Detection Accuracy</span>
                    <span>{stats.accuracy}%</span>
                  </div>
                  <Progress value={stats.accuracy} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Content Coverage</span>
                    <span>87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Response Time</span>
                    <span>98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {actions.slice(0, 5).map(action => (
                  <div key={action.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                    {getActionIcon(action.type)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{action.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.username} • {action.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(action.status)}`}>
                      {action.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Moderation Rules</h3>
            <div className="flex gap-2">
              {(['strict', 'moderate', 'relaxed'] as const).map(level => (
                <Button
                  key={level}
                  variant={moderationLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModerationLevel(level)}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map(rule => (
              <Card key={rule.id} className={`transition-all ${rule.enabled ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(rule.category)}
                      <h4 className="font-medium">{rule.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {rule.confidence}%
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRule(rule.id)}
                        className={`h-8 w-8 p-0 ${rule.enabled ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {rule.enabled ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs ${
                      rule.severity === 'high' ? 'bg-red-100 text-red-800' :
                      rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rule.severity} severity
                    </Badge>
                    
                    <div className="text-xs text-muted-foreground">
                      {rule.category}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Moderation Actions</h3>
            <Button variant="outline" size="sm">
              <Flag size={16} className="mr-2" />
              Export Report
            </Button>
          </div>

          <div className="space-y-3">
            {actions.map(action => (
              <Card key={action.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getActionIcon(action.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{action.reason}</h4>
                        <Badge className={`text-xs ${getStatusColor(action.status)}`}>
                          {action.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {action.confidence}% confidence
                        </Badge>
                      </div>
                      
                      <div className="bg-muted/50 p-2 rounded text-sm mb-2">
                        <strong>Content:</strong> {action.content}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>User: {action.username}</span>
                        <span>{action.timestamp.toLocaleString()}</span>
                        {action.reviewedBy && <span>Reviewed by: {action.reviewedBy}</span>}
                      </div>
                    </div>
                    
                    {action.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reviewAction(action.id, true)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reviewAction(action.id, false)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Moderation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Moderation Level</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['strict', 'moderate', 'relaxed'] as const).map(level => (
                    <Card 
                      key={level} 
                      className={`cursor-pointer transition-all ${
                        moderationLevel === level ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setModerationLevel(level)}
                    >
                      <CardContent className="p-4 text-center">
                        <h5 className="font-medium capitalize mb-2">{level}</h5>
                        <p className="text-sm text-muted-foreground">
                          {level === 'strict' && 'Maximum protection, may have false positives'}
                          {level === 'moderate' && 'Balanced approach, recommended for most communities'}
                          {level === 'relaxed' && 'Minimal intervention, only severe violations'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Advanced Options</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Auto-approve low-risk actions</Label>
                      <p className="text-sm text-muted-foreground">Actions with >95% confidence are auto-approved</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings size={16} />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Learning mode</Label>
                      <p className="text-sm text-muted-foreground">AI learns from manual reviews to improve accuracy</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Brain size={16} />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Real-time monitoring</Label>
                      <p className="text-sm text-muted-foreground">Monitor messages in real-time for instant action</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Zap size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIModeration;