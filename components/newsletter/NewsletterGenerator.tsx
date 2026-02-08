"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Wand2, 
  Eye, 
  Download, 
  Send, 
  RefreshCw,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Type,
  Palette,
  Layout,
  Brain,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
}

const templates: NewsletterTemplate[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Clean, professional design with focus on content",
    preview: "Modern minimal template preview"
  },
  {
    id: "bold-gradient",
    name: "Bold Gradient",
    description: "Eye-catching design with vibrant gradients",
    preview: "Bold gradient template preview"
  },
  {
    id: "newsletter-classic",
    name: "Newsletter Classic",
    description: "Traditional newsletter layout with sections",
    preview: "Classic newsletter template preview"
  },
  {
    id: "tech-focused",
    name: "Tech Focused",
    description: "Modern tech aesthetic with code-inspired design",
    preview: "Tech focused template preview"
  }
];

export default function NewsletterGenerator() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern-minimal");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [ctaText, setCtaText] = useState("Read More");
  const [ctaUrl, setCtaUrl] = useState("");
  const [previewMode, setPreviewMode] = useState<"editor" | "preview">("editor");
  const [useAI, setUseAI] = useState(true);
  const [aiMode, setAiMode] = useState<"enhance" | "generate" | "rewrite">("enhance");
  const [topic, setTopic] = useState("");

  // Fetch Substack posts
  const { data: substackPosts, isLoading: loadingPosts } = useQuery({
    queryKey: ["/api/newsletter/substack/posts"],
    queryFn: async () => {
      const response = await fetch("/api/newsletter/substack/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch Substack posts");
      }
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Generate newsletter mutation
  const generateMutation = useMutation({
    mutationFn: async (data: {
      template: string;
      title: string;
      subtitle: string;
      content: string;
      ctaText: string;
      ctaUrl: string;
      useAI?: boolean;
      aiMode?: "enhance" | "generate" | "rewrite";
      topic?: string;
    }) => {
      const response = await fetch("/api/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate newsletter");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Newsletter Generated!",
        description: data.aiEnhanced 
          ? "Your AI-enhanced newsletter HTML is ready." 
          : "Your beautiful newsletter HTML is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate newsletter",
        variant: "destructive",
      });
    },
  });

  // Publish to Substack mutation
  const publishMutation = useMutation({
    mutationFn: async (data: {
      html: string;
      title: string;
      subtitle?: string;
    }) => {
      const response = await fetch("/api/newsletter/substack/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to publish to Substack");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Published to Substack!",
        description: `Your newsletter has been published successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Publish Failed",
        description: error.message || "Failed to publish to Substack",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    // If using AI generate mode, only topic is required
    if (useAI && aiMode === "generate") {
      if (!topic.trim()) {
        toast({
          title: "Missing Topic",
          description: "Please enter a topic for AI generation",
          variant: "destructive",
        });
        return;
      }
    } else {
      // For enhance/rewrite modes, title and content are required
      if (!title || !content) {
        toast({
          title: "Missing Fields",
          description: "Please fill in title and content",
          variant: "destructive",
        });
        return;
      }
    }

    generateMutation.mutate({
      template: selectedTemplate,
      title: useAI && aiMode === "generate" ? "" : title,
      subtitle,
      content: useAI && aiMode === "generate" ? "" : content,
      ctaText,
      ctaUrl,
      useAI,
      aiMode,
      topic: useAI && aiMode === "generate" ? topic : undefined,
    });
  };

  const handlePublish = () => {
    if (!generateMutation.data?.html) {
      toast({
        title: "No Newsletter Generated",
        description: "Please generate a newsletter first",
        variant: "destructive",
      });
      return;
    }

    publishMutation.mutate({
      html: generateMutation.data.html,
      title,
      subtitle: subtitle || undefined,
    });
  };

  const handleUseSubstackPost = (post: any) => {
    setTitle(post.title || "");
    setSubtitle(post.subtitle || "");
    setContent(post.excerpt || post.content || "");
    if (post.url) {
      setCtaUrl(post.url);
    }
    toast({
      title: "Post Loaded",
      description: "Substack post content has been loaded into the editor",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#f5f5f7] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#00d4aa]" />
            Newsletter Generator
          </h2>
          <p className="text-sm text-[#8e919a] mt-1">
            Create beautiful newsletters and publish directly to Substack
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(previewMode === "editor" ? "preview" : "editor")}
            className="bg-[#181b22] border-white/5 text-[#f5f5f7] hover:bg-[#1a1d25]"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode === "editor" ? "Preview" : "Edit"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="bg-[#181b22] border border-white/5 mb-6">
          <TabsTrigger value="create" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">
            Create Newsletter
          </TabsTrigger>
          <TabsTrigger value="substack" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">
            Substack Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Template Selection */}
            <Card className="bg-[#14161c] border-white/5">
              <CardHeader>
                <CardTitle className="text-[#f5f5f7] flex items-center gap-2">
                  <Layout className="w-5 h-5 text-[#00d4aa]" />
                  Choose Template
                </CardTitle>
                <CardDescription className="text-[#8e919a]">
                  Select a beautiful template for your newsletter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedTemplate === template.id
                          ? "border-[#00d4aa] bg-[rgba(0,212,170,0.1)]"
                          : "border-white/5 bg-[#181b22] hover:border-white/10"
                      }`}
                    >
                      <div className="font-semibold text-sm text-[#f5f5f7] mb-1">
                        {template.name}
                      </div>
                      <div className="text-xs text-[#8e919a]">
                        {template.description}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="bg-[#14161c] border-white/5">
              <CardHeader>
                <CardTitle className="text-[#f5f5f7] flex items-center gap-2">
                  <Type className="w-5 h-5 text-[#00d4aa]" />
                  Newsletter Content
                </CardTitle>
                <CardDescription className="text-[#8e919a]">
                  Enter your newsletter content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#181b22] rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-[#00d4aa]" />
                    <div>
                      <Label htmlFor="ai-toggle" className="text-[#f5f5f7] font-medium cursor-pointer">
                        AI Enhancement
                      </Label>
                      <p className="text-xs text-[#8e919a]">Use Claude AI to enhance or generate content</p>
                    </div>
                  </div>
                  <Switch
                    id="ai-toggle"
                    checked={useAI}
                    onCheckedChange={setUseAI}
                    className="data-[state=checked]:bg-[#00d4aa]"
                  />
                </div>

                {/* AI Mode Selection */}
                {useAI && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#f5f5f7]">AI Mode</Label>
                    <Select value={aiMode} onValueChange={(value: any) => setAiMode(value)}>
                      <SelectTrigger className="bg-[#181b22] border-white/5 text-[#f5f5f7]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#14161c] border-white/5">
                        <SelectItem value="enhance">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Enhance Existing Content
                          </div>
                        </SelectItem>
                        <SelectItem value="generate">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Generate from Topic
                          </div>
                        </SelectItem>
                        <SelectItem value="rewrite">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Rewrite Content
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Topic Input for Generate Mode */}
                {useAI && aiMode === "generate" && (
                  <div>
                    <Label className="text-sm font-medium text-[#f5f5f7] mb-2 block">
                      Topic *
                    </Label>
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., O-1A visa success stories, EB-2 NIW updates..."
                      className="bg-[#181b22] border-white/5 text-[#f5f5f7]"
                    />
                    <p className="text-xs text-[#8e919a] mt-1">
                      AI will generate title, subtitle, and content based on this topic
                    </p>
                  </div>
                )}

                {!(useAI && aiMode === "generate") && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-[#f5f5f7] mb-2 block">
                        Title *
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Newsletter Title"
                        className="bg-[#181b22] border-white/5 text-[#f5f5f7]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#f5f5f7] mb-2 block">
                        Subtitle
                      </label>
                      <Input
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="Optional subtitle"
                        className="bg-[#181b22] border-white/5 text-[#f5f5f7]"
                        disabled={useAI && aiMode === "generate"}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#f5f5f7] mb-2 block">
                        Content *
                      </label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={useAI && aiMode === "rewrite" 
                          ? "Content to rewrite..." 
                          : "Write your newsletter content here..."}
                        rows={8}
                        className="bg-[#181b22] border-white/5 text-[#f5f5f7]"
                        disabled={useAI && aiMode === "generate"}
                      />
                      {useAI && aiMode === "enhance" && (
                        <p className="text-xs text-[#8e919a] mt-1">
                          AI will enhance this content to be more engaging
                        </p>
                      )}
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#f5f5f7] mb-2 block">
                      CTA Text
                    </label>
                    <Input
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Read More"
                      className="bg-[#181b22] border-white/5 text-[#f5f5f7]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#f5f5f7] mb-2 block">
                      CTA URL
                    </label>
                    <Input
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-[#181b22] border-white/5 text-[#f5f5f7]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card className="bg-[#14161c] border-white/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending || !title || !content}
                  className="flex-1 bg-gradient-to-br from-[#00d4aa] to-[#00b894] text-[#0a0b0d] hover:shadow-[0_8px_24px_rgba(0,212,170,0.15)] hover:-translate-y-0.5 transition-all"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Newsletter
                    </>
                  )}
                </Button>
                {generateMutation.data?.html && (
                  <>
                    <Button
                      onClick={handlePublish}
                      disabled={publishMutation.isPending}
                      className="flex-1 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] text-white hover:shadow-[0_8px_24px_rgba(107,95,207,0.15)] hover:-translate-y-0.5 transition-all"
                    >
                      {publishMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Publish to Substack
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([generateMutation.data.html], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-newsletter.html`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-[#181b22] border-white/5 text-[#f5f5f7] hover:bg-[#1a1d25]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download HTML
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {generateMutation.data?.html && previewMode === "preview" && (
            <Card className="bg-[#14161c] border-white/5">
              <CardHeader>
                <CardTitle className="text-[#f5f5f7] flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#00d4aa]" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="bg-white rounded-lg p-8 max-h-[600px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: generateMutation.data.html }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="substack" className="space-y-4">
          <Card className="bg-[#14161c] border-white/5">
            <CardHeader>
              <CardTitle className="text-[#f5f5f7]">Substack Posts</CardTitle>
              <CardDescription className="text-[#8e919a]">
                Use existing Substack posts as a starting point for your newsletter
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPosts ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-[#181b22] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : substackPosts?.posts?.length > 0 ? (
                <div className="space-y-3">
                  {substackPosts.posts.slice(0, 10).map((post: any) => (
                    <div
                      key={post.id}
                      className="p-4 bg-[#181b22] rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                      onClick={() => handleUseSubstackPost(post)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#f5f5f7] mb-1">{post.title}</h3>
                          {post.subtitle && (
                            <p className="text-sm text-[#8e919a] mb-2">{post.subtitle}</p>
                          )}
                          {post.excerpt && (
                            <p className="text-xs text-[#5a5d66] line-clamp-2">{post.excerpt}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseSubstackPost(post);
                          }}
                          className="ml-4 text-[#00d4aa] hover:text-[#00b894] hover:bg-[rgba(0,212,170,0.1)]"
                        >
                          Use
                        </Button>
                      </div>
                      {post.publishedAt && (
                        <div className="mt-2 text-xs text-[#5a5d66]">
                          Published: {new Date(post.publishedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#8e919a]">
                  <p>No Substack posts found</p>
                  <p className="text-sm text-[#5a5d66] mt-1">
                    Make sure your Substack integration is configured
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
