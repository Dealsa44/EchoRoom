import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Award, Languages, MessageCircle, Zap, Target, Heart, Calendar, Clock, Star, TrendingUp } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';

const ProfileStats = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Your Journey" showBack onBack={() => navigate('/profile')} />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Your EchoRoom Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Featured Achievement */}
            <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 p-4 rounded-xl border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-primary">Language Explorer</div>
                  <div className="text-xs text-muted-foreground">Earned for completing 100+ conversations</div>
                </div>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Language Learning */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600">Learning</span>
                </div>
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">127</div>
                <div className="text-xs text-blue-600/70">Words learned</div>
              </div>

              {/* Conversations */}
              <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600">Social</span>
                </div>
                <div className="text-lg font-bold text-green-700 dark:text-green-300">89</div>
                <div className="text-xs text-green-600/70">Conversations</div>
              </div>

              {/* Streak */}
              <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">Streak</span>
                </div>
                <div className="text-lg font-bold text-orange-700 dark:text-orange-300">7</div>
                <div className="text-xs text-orange-600/70">Days active</div>
              </div>

              {/* Corrections */}
              <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">Progress</span>
                </div>
                <div className="text-lg font-bold text-purple-700 dark:text-purple-300">23</div>
                <div className="text-xs text-purple-600/70">Corrections</div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Matches made</span>
                </div>
                <span className="font-semibold text-red-600">12</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Days on EchoRoom</span>
                </div>
                <span className="font-semibold text-blue-600">45</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span>Hours practiced</span>
                </div>
                <span className="font-semibold text-green-600">18.5</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Forum contributions</span>
                </div>
                <span className="font-semibold text-yellow-600">34</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span>Learning level</span>
                </div>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  Intermediate B2
                </Badge>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 pt-2 border-t">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Weekly Goal</span>
                  <span>7/10 conversations</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Monthly Learning</span>
                  <span>380/500 words</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>
            </div>

            {/* Additional Journey Insights */}
            <div className="space-y-3 pt-2 border-t">
              <h4 className="font-medium text-sm">Journey Insights</h4>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">🌟 Most Active Time</div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300">You're most active between 7-9 PM</div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">📈 Best Learning Day</div>
                <div className="text-xs text-green-700 dark:text-green-300">Tuesdays: +15% more words learned</div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">🎯 Favorite Topics</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Philosophy, Technology, Travel</div>
              </div>
            </div>


          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProfileStats;