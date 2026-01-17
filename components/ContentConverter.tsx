import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, FileText, DollarSign, Users, TrendingUp, ExternalLink } from 'lucide-react';

interface SubstackPost {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  publishedAt: string;
  slug: string;
  url: string;
  excerpt: string;
  readingTime: number;
  categories: string[];
}

interface ConversionCandidate {
  post: SubstackPost;
  suggestedCategory: string;
  conversionScore: number;
  reasoning: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  structure: string[];
  targetLength: number;
}

export function ContentConverter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [targetCategory, setTargetCategory] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Fetch Substack recommendations
  const { data: recommendations, isLoading: loadingRecommendations } = useQuery({
    queryKey: ['/api/content/substack/recommendations'],
    refetchInterval: false
  });

  // Fetch content templates
  const { data: templatesData, isLoading: loadingTemplates } = useQuery({
    queryKey: ['/api/content/templates'],
    refetchInterval: false
  });

  // Convert Substack post mutation
  const convertPostMutation = useMutation({
    mutationFn: async (data: { postId: string; customTitle?: string; customCategory?: string }) => {
      return await apiRequest('/api/content/substack/convert', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Conversion Successful!",
        description: `Substack post converted to lead magnet: ${data.magnetId}`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lead-magnets'] });
      setSelectedPost('');
      setCustomTitle('');
      setCustomCategory('');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Conversion Failed",
        description: error.message || "Failed to convert Substack post"
      });
    }
  });

  // Convert custom content mutation
  const convertContentMutation = useMutation({
    mutationFn: async (data: {
      sourceContent: string;
      targetCategory: string;
      customTitle?: string;
      customDescription?: string;
      template?: string;
      sourceUrl?: string;
    }) => {
      return await apiRequest('/api/content/convert', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Content Converted!",
        description: `Content converted to lead magnet: ${data.magnetId}`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lead-magnets'] });
      setCustomContent('');
      setTargetCategory('');
      setSelectedTemplate('');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Conversion Failed",
        description: error.message || "Failed to convert content"
      });
    }
  });

  const handleConvertPost = () => {
    if (!selectedPost) {
      toast({
        variant: "destructive",
        title: "Selection Required",
        description: "Please select a Substack post to convert"
      });
      return;
    }

    convertPostMutation.mutate({
      postId: selectedPost,
      customTitle: customTitle || undefined,
      customCategory: customCategory || undefined
    });
  };

  const handleConvertCustomContent = () => {
    if (!customContent.trim() || !targetCategory) {
      toast({
        variant: "destructive",
        title: "Content Required",
        description: "Please provide content and select a target category"
      });
      return;
    }

    convertContentMutation.mutate({
      sourceContent: customContent,
      targetCategory,
      template: selectedTemplate || undefined
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loadingRecommendations || loadingTemplates) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const candidates = (recommendations as any)?.recommendedConversions || [];
  const templates = (templatesData as any)?.templates || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Content Converter
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Transform your Substack content and other materials into high-converting lead magnets
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {(recommendations as any)?.totalPosts || 0} Posts Available
        </Badge>
      </div>

      {/* Conversion Recommendations Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Posts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {(recommendations as any)?.totalPosts || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  High-Value Candidates
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {candidates.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Potential Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency((recommendations as any)?.potentialLeadValue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="substack" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="substack">Substack Conversion</TabsTrigger>
          <TabsTrigger value="custom">Custom Content</TabsTrigger>
        </TabsList>

        <TabsContent value="substack" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Convert Substack Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidates.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  No high-value conversion candidates found. All posts may already be converted or need manual review.
                </p>
              ) : (
                <>
                  <div className="grid gap-4">
                    {candidates.slice(0, 5).map((candidate: any) => (
                      <div
                        key={candidate.post.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPost === candidate.post.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPost(candidate.post.id)}
                        data-testid={`post-candidate-${candidate.post.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {candidate.post.title}
                            </h3>
                            {candidate.post.subtitle && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {candidate.post.subtitle}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="outline">
                                Score: {candidate.conversionScore}/10
                              </Badge>
                              <Badge variant="secondary">
                                {candidate.suggestedCategory}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {candidate.post.readingTime} min read
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {candidate.reasoning}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(candidate.post.url, '_blank');
                            }}
                            data-testid={`view-post-${candidate.post.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="custom-title">Custom Title (Optional)</Label>
                      <Input
                        id="custom-title"
                        placeholder="Override default title..."
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        data-testid="input-custom-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-category">Custom Category (Optional)</Label>
                      <Select value={customCategory} onValueChange={setCustomCategory}>
                        <SelectTrigger data-testid="select-custom-category">
                          <SelectValue placeholder="Override suggested category..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="h1b">H1B</SelectItem>
                          <SelectItem value="eb5">EB-5</SelectItem>
                          <SelectItem value="greencard">Green Card</SelectItem>
                          <SelectItem value="uscis">USCIS</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleConvertPost}
                    disabled={!selectedPost || convertPostMutation.isPending}
                    className="w-full"
                    data-testid="button-convert-post"
                  >
                    {convertPostMutation.isPending ? 'Converting...' : 'Convert Selected Post'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Convert Custom Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-content">Source Content</Label>
                <Textarea
                  id="custom-content"
                  placeholder="Paste your content here (blog post, article, etc.)..."
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={8}
                  data-testid="textarea-custom-content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target-category">Target Category</Label>
                  <Select value={targetCategory} onValueChange={setTargetCategory}>
                    <SelectTrigger data-testid="select-target-category">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h1b">H1B</SelectItem>
                      <SelectItem value="eb5">EB-5</SelectItem>
                      <SelectItem value="greencard">Green Card</SelectItem>
                      <SelectItem value="uscis">USCIS</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="template-select">Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger data-testid="select-template">
                      <SelectValue placeholder="Choose template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template: ContentTemplate) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTemplate && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-2">Template Structure:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {templates.find((t: ContentTemplate) => t.id === selectedTemplate)?.structure.map((section: string, index: number) => (
                      <li key={index}>• {section}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={handleConvertCustomContent}
                disabled={!customContent.trim() || !targetCategory || convertContentMutation.isPending}
                className="w-full"
                data-testid="button-convert-content"
              >
                {convertContentMutation.isPending ? 'Converting...' : 'Convert Content'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}