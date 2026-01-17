import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Target,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subreddit {
  name: string;
  description: string;
  focus: string;
}

interface SubredditData {
  success: boolean;
  subreddits: Subreddit[];
  highValueKeywords: string[];
  totalChannels: number;
  newChannelsAdded: string[];
  focusAreas: string[];
}

export default function ImmigrationChannels() {
  const [channels, setChannels] = useState<SubredditData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/immigration/subreddits');
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Failed to fetch immigration channels:', error);
      toast({
        title: "Failed to load channels",
        description: "Could not fetch immigration subreddit information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-orange-500" />
            Reddit Immigration Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!channels) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            Failed to Load Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Unable to load immigration subreddit information.</p>
          <Button onClick={fetchChannels} className="mt-3">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-orange-500" />
              Reddit Immigration Channels
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              {channels.totalChannels} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{channels.totalChannels}</div>
              <div className="text-sm text-gray-600">Total Channels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{channels.newChannelsAdded.length}</div>
              <div className="text-sm text-gray-600">Newly Added</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{channels.focusAreas.length}</div>
              <div className="text-sm text-gray-600">Focus Areas</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">New Channels Added:</h4>
              <div className="flex flex-wrap gap-2">
                {channels.newChannelsAdded.map((channel) => (
                  <Badge key={channel} variant="secondary" className="bg-green-100 text-green-700">
                    r/{channel}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Focus Areas:</h4>
              <div className="flex flex-wrap gap-2">
                {channels.focusAreas.map((area) => (
                  <Badge key={area} variant="outline" className="text-purple-600 border-purple-600">
                    <Target className="h-3 w-3 mr-1" />
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subreddit Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Active Subreddits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {channels.subreddits.map((subreddit) => (
              <div 
                key={subreddit.name}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-lg text-orange-600">
                      r/{subreddit.name}
                    </h3>
                    {channels.newChannelsAdded.includes(subreddit.name) && (
                      <Badge className="ml-2 bg-green-100 text-green-700">NEW</Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a 
                      href={`https://reddit.com/r/${subreddit.name}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-gray-600 text-sm mb-2">{subreddit.description}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                  <span className="text-blue-600 font-medium">{subreddit.focus}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* High-Value Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>High-Value Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {channels.highValueKeywords.map((keyword) => (
              <div key={keyword} className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium text-blue-800">{keyword}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}