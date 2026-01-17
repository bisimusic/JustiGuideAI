import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useUTMTracking } from '@/hooks/useUTMTracking';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, Code, Eye, Palette, Zap } from 'lucide-react';

interface PromotionalWidget {
  id: string;
  type: 'lead_magnet' | 'email_signup' | 'platform_promotion';
  title: string;
  description: string;
  callToAction: string;
  targetUrl: string;
  htmlCode: string;
  trackingParams: Record<string, string>;
}

export function WidgetGenerator() {
  const { toast } = useToast();
  const { getTrackingParameters, utmData } = useUTMTracking();
  const [widgetType, setWidgetType] = useState<'lead_magnet' | 'email_signup' | 'platform_promotion'>('lead_magnet');
  const [targetId, setTargetId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [widgetStyle, setWidgetStyle] = useState<'banner' | 'sidebar' | 'inline' | 'popup'>('inline');
  const [generatedWidget, setGeneratedWidget] = useState<PromotionalWidget | null>(null);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview');

  // Fetch lead magnets for selection
  const { data: leadMagnetsData } = useQuery({
    queryKey: ['/api/lead-magnets'],
    refetchInterval: false
  });

  // Generate widget mutation
  const generateWidgetMutation = useMutation({
    mutationFn: async (data: {
      type: string;
      targetId?: string;
      customTitle?: string;
      customDescription?: string;
      style?: string;
    }) => {
      // Include comprehensive UTM tracking data in widget generation
      const trackingParams = getTrackingParameters();
      
      return await apiRequest('/api/cross-promotion/generate-widget', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          // Pass UTM data to backend for widget generation
          utmParameters: trackingParams,
          sessionId: utmData?.session_id,
          sourceContext: {
            landingPage: utmData?.landing_page,
            referrer: utmData?.referrer,
            isReturningVisitor: utmData?.is_returning_visitor,
            capturedAt: utmData?.captured_at
          }
        })
      });
    },
    onSuccess: (data) => {
      setGeneratedWidget(data.widget);
      toast({
        title: "Widget Generated!",
        description: "Your promotional widget is ready to embed in your blog posts."
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate widget"
      });
    }
  });

  const handleGenerateWidget = () => {
    if (widgetType === 'lead_magnet' && !targetId) {
      toast({
        variant: "destructive",
        title: "Selection Required",
        description: "Please select a lead magnet for promotion"
      });
      return;
    }

    generateWidgetMutation.mutate({
      type: widgetType,
      targetId: targetId || undefined,
      customTitle: customTitle || undefined,
      customDescription: customDescription || undefined,
      style: widgetStyle
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Widget code copied to clipboard"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Unable to copy to clipboard"
      });
    }
  };

  const leadMagnets = (leadMagnetsData as any)?.magnets || [];

  const getWidgetTypeDescription = (type: string) => {
    const descriptions = {
      'lead_magnet': 'Promote a specific lead magnet or guide to capture targeted leads',
      'email_signup': 'General email signup widget to build your subscriber list',
      'platform_promotion': 'Promote the main JustiGuide platform and services'
    };
    return descriptions[type as keyof typeof descriptions] || '';
  };

  const getStyleDescription = (style: string) => {
    const descriptions = {
      'banner': 'Full-width banner ideal for top/bottom of posts',
      'sidebar': 'Compact widget perfect for sidebar placement',
      'inline': 'Inline widget that flows naturally within content',
      'popup': 'Attention-grabbing popup style widget'
    };
    return descriptions[style as keyof typeof descriptions] || '';
  };

  return (
    <div className="space-y-6">
      {/* Widget Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Widget Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="widget-type">Widget Type</Label>
              <Select value={widgetType} onValueChange={(value: any) => setWidgetType(value)}>
                <SelectTrigger data-testid="select-widget-type">
                  <SelectValue placeholder="Select widget type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_magnet">Lead Magnet Promotion</SelectItem>
                  <SelectItem value="email_signup">Email Signup</SelectItem>
                  <SelectItem value="platform_promotion">Platform Promotion</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {getWidgetTypeDescription(widgetType)}
              </p>
            </div>

            <div>
              <Label htmlFor="widget-style">Widget Style</Label>
              <Select value={widgetStyle} onValueChange={(value: any) => setWidgetStyle(value)}>
                <SelectTrigger data-testid="select-widget-style">
                  <SelectValue placeholder="Select widget style..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="inline">Inline</SelectItem>
                  <SelectItem value="popup">Popup</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {getStyleDescription(widgetStyle)}
              </p>
            </div>
          </div>

          {widgetType === 'lead_magnet' && (
            <div>
              <Label htmlFor="target-magnet">Target Lead Magnet</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger data-testid="select-target-magnet">
                  <SelectValue placeholder="Select lead magnet to promote..." />
                </SelectTrigger>
                <SelectContent>
                  {leadMagnets.map((magnet: any) => (
                    <SelectItem key={magnet.id} value={magnet.id}>
                      {magnet.title} ({magnet.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="custom-description">Custom Description (Optional)</Label>
              <Textarea
                id="custom-description"
                placeholder="Override default description..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={2}
                data-testid="textarea-custom-description"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateWidget}
            disabled={generateWidgetMutation.isPending || (widgetType === 'lead_magnet' && !targetId)}
            className="w-full"
            data-testid="button-generate-widget"
          >
            {generateWidgetMutation.isPending ? 'Generating...' : 'Generate Widget'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Widget Display */}
      {generatedWidget && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Generated Widget
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{generatedWidget.type}</Badge>
                <Badge variant="secondary">{widgetStyle}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={previewMode} onValueChange={(value: any) => setPreviewMode(value)}>
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">HTML Code</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div dangerouslySetInnerHTML={{ __html: generatedWidget.htmlCode }} />
                </div>
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                <div className="relative">
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{generatedWidget.htmlCode}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generatedWidget.htmlCode)}
                    data-testid="button-copy-html"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Widget Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Target URL:</Label>
                <p className="text-gray-600 dark:text-gray-400 truncate">{generatedWidget.targetUrl}</p>
              </div>
              <div>
                <Label>Widget ID:</Label>
                <p className="text-gray-600 dark:text-gray-400">{generatedWidget.id}</p>
              </div>
            </div>

            {/* Tracking Parameters */}
            <div>
              <Label>Tracking Parameters:</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(generatedWidget.trackingParams).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-500">{key}:</span>
                    <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How to Use This Widget:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Copy the HTML code above</li>
                <li>2. Paste it into your Substack post where you want the promotion to appear</li>
                <li>3. The widget will automatically track clicks and conversions</li>
                <li>4. Monitor performance in the Cross-Promotion Analytics dashboard</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}