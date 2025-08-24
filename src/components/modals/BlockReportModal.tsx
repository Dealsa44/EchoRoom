import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Shield, 
  UserX, 
  Flag, 
  AlertCircle, 
  CheckCircle, 
  X,
  Eye,
  EyeOff,
  Lock,
  Users,
  MessageSquare,
  Heart,
  Camera,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface BlockReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    avatar: string;
    age?: number;
    location?: string;
  };
  onBlock: (userId: string, reason: string) => void;
  onReport: (userId: string, reportData: ReportData) => void;
}

interface ReportData {
  reason: string;
  category: string;
  description: string;
  evidence: string[];
  urgent: boolean;
  blockAfterReport: boolean;
}

const BlockReportModal: React.FC<BlockReportModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onBlock,
  onReport
}) => {
  const [activeTab, setActiveTab] = useState<'block' | 'report'>('block');
  const [blockReason, setBlockReason] = useState('');
  const [reportData, setReportData] = useState<ReportData>({
    reason: '',
    category: '',
    description: '',
    evidence: [],
    urgent: false,
    blockAfterReport: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const blockReasons = [
    'Inappropriate behavior',
    'Harassment or bullying',
    'Spam or fake profile',
    'Underage user',
    'Inappropriate photos',
    'Threatening messages',
    'Catfishing or impersonation',
    'Other'
  ];

  const reportCategories = [
    'Harassment or bullying',
    'Inappropriate content',
    'Spam or fake profile',
    'Underage user',
    'Threats or violence',
    'Sexual content',
    'Hate speech',
    'Impersonation',
    'Other'
  ];

  const evidenceTypes = [
    'Screenshots',
    'Message history',
    'Profile photos',
    'Location data',
    'Voice messages',
    'Video calls',
    'Other'
  ];

  const handleBlock = async () => {
    if (!blockReason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onBlock(targetUser.id, blockReason);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Block failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!reportData.reason.trim() || !reportData.category || !reportData.description.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onReport(targetUser.id, reportData);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Report failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvidenceToggle = (evidence: string) => {
    setReportData(prev => ({
      ...prev,
      evidence: prev.evidence.includes(evidence)
        ? prev.evidence.filter(e => e !== evidence)
        : [...prev.evidence, evidence]
    }));
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-[calc(100vw-2rem)] max-w-sm mx-auto">
          <CardContent className="p-6 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === 'block' ? 'User Blocked' : 'Report Submitted'}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === 'block' 
                ? `${targetUser.name} has been blocked and can no longer contact you.`
                : 'Your report has been submitted and will be reviewed by our safety team.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-[calc(100vw-2rem)] max-w-sm mx-auto max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{targetUser.avatar}</div>
              <div>
                <CardTitle className="text-base">{targetUser.name}</CardTitle>
                {targetUser.age && (
                  <p className="text-xs text-muted-foreground">
                    {targetUser.age} years old
                    {targetUser.location && ` • ${targetUser.location}`}
                  </p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b">
            <Button
              variant={activeTab === 'block' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('block')}
              className="flex items-center gap-2 text-sm"
              size="sm"
            >
              <UserX size={14} />
              Block User
            </Button>
            <Button
              variant={activeTab === 'report' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('report')}
              className="flex items-center gap-2 text-sm"
              size="sm"
            >
              <Shield size={14} />
              Report User
            </Button>
          </div>

          {/* Block Tab */}
          {activeTab === 'block' && (
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-amber-800 dark:text-amber-200 mb-1">
                      Blocking {targetUser.name}
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      This user will no longer be able to send you messages, see your profile, or match with you. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blockReason" className="text-sm">Reason for blocking:</Label>
                <Select value={blockReason} onValueChange={setBlockReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {blockReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-3">
                <Button variant="outline" onClick={onClose} className="flex-1" size="sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleBlock}
                  disabled={!blockReason.trim() || isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  {isSubmitting ? 'Blocking...' : 'Block User'}
                </Button>
              </div>
            </div>
          )}

          {/* Report Tab */}
          {activeTab === 'report' && (
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-1">
                      Report {targetUser.name}
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Help us keep our community safe by reporting inappropriate behavior. 
                      All reports are reviewed by our safety team.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reportCategory" className="text-sm">Category:</Label>
                  <Select value={reportData.category} onValueChange={(value) => setReportData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportReason" className="text-sm">Specific reason:</Label>
                  <Input
                    id="reportReason"
                    placeholder="Brief description of the issue"
                    value={reportData.reason}
                    onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportDescription" className="text-sm">Detailed description:</Label>
                <Textarea
                  id="reportDescription"
                  placeholder="Please provide as many details as possible about what happened..."
                  value={reportData.description}
                  onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Evidence available:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {evidenceTypes.map((evidence) => (
                    <div key={evidence} className="flex items-center space-x-2">
                      <Checkbox
                        id={evidence}
                        checked={reportData.evidence.includes(evidence)}
                        onCheckedChange={() => handleEvidenceToggle(evidence)}
                      />
                      <Label htmlFor={evidence} className="text-xs">{evidence}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urgent"
                    checked={reportData.urgent}
                    onCheckedChange={(checked) => setReportData(prev => ({ ...prev, urgent: checked as boolean }))}
                  />
                  <Label htmlFor="urgent" className="text-xs font-medium">
                    This is urgent - requires immediate attention
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="blockAfterReport"
                    checked={reportData.blockAfterReport}
                    onCheckedChange={(checked) => setReportData(prev => ({ ...prev, blockAfterReport: checked as boolean }))}
                  />
                  <Label htmlFor="blockAfterReport" className="text-xs">
                    Block this user after submitting the report
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <Button variant="outline" onClick={onClose} className="flex-1" size="sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleReport}
                  disabled={!reportData.reason.trim() || !reportData.category || !reportData.description.trim() || isSubmitting}
                  className="flex-1"
                  size="sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockReportModal;
