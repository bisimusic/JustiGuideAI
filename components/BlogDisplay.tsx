import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, Calendar } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  url: string;
  publishedAt: string;
  readingTime: number;
  categories: string[];
}

interface BlogDisplayProps {
  limit?: number;
  showCategories?: boolean;
  layout?: 'grid' | 'list';
  title?: string;
}

export function BlogDisplay({ 
  limit = 5, 
  showCategories = true, 
  layout = 'grid',
  title = 'Latest Immigration Insights'
}: BlogDisplayProps) {
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['/api/content/substack/posts'],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const posts = (postsData as any)?.posts || [];
  const displayPosts = posts.slice(0, limit);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Unable to load blog posts at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'h1b': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'eb5': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'greencard': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'policy': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'general': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colorMap[category] || colorMap['general'];
  };

  if (layout === 'list') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayPosts.map((post: BlogPost) => (
            <div
              key={post.id}
              className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              data-testid={`blog-post-${post.id}`}
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {post.title}
                </h3>
                {post.subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {post.subtitle}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(post.publishedAt)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.readingTime} min read
                  </div>
                  {showCategories && post.categories.length > 0 && (
                    <div className="flex gap-1">
                      {post.categories.slice(0, 2).map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className={`text-xs ${getCategoryColor(category)}`}
                        >
                          {category.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(post.url, '_blank')}
                data-testid={`view-blog-post-${post.id}`}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Grid layout
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPosts.map((post: BlogPost) => (
          <Card 
            key={post.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.open(post.url, '_blank')}
            data-testid={`blog-card-${post.id}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">
                  {post.title}
                </CardTitle>
                <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
              </div>
              {post.subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {post.subtitle}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(post.publishedAt)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.readingTime}m
                  </div>
                </div>
                
                {showCategories && post.categories.length > 0 && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getCategoryColor(post.categories[0])}`}
                  >
                    {post.categories[0].toUpperCase()}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}