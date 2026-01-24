import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Star,
  Building2,
  Mail,
  Search,
  Filter
} from 'lucide-react';

interface PersonaInsight {
  category: string;
  count: number;
  avgRevenuePotential: number;
  keyCharacteristics: string[];
  investmentPatterns: string[];
  communicationPreferences: string[];
  riskProfile: 'high' | 'medium' | 'low';
  timeToConversion: string;
  examples: Array<{
    email: string;
    company?: string;
    notes?: string;
  }>;
}

interface InvestorProfile {
  type: 'angel' | 'vc' | 'strategic' | 'family_office' | 'accelerator' | 'government' | 'foundation';
  name: string;
  email: string;
  company: string;
  investmentFocus: string[];
  checkSize: string;
  stage: string[];
  geography: string;
  confidence: number;
}

const riskColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
};

const investorTypeColors = {
  angel: 'bg-purple-100 text-purple-800',
  vc: 'bg-blue-100 text-blue-800',
  strategic: 'bg-green-100 text-green-800',
  family_office: 'bg-orange-100 text-orange-800',
  accelerator: 'bg-pink-100 text-pink-800',
  government: 'bg-gray-100 text-gray-800',
  foundation: 'bg-indigo-100 text-indigo-800'
};

export default function EnhancedPersonaDashboard() {
  const [sampleSize, setSampleSize] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch extended persona analysis
  const { data: analysisData, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery({
    queryKey: ['/api/persona/extended-analysis', sampleSize],
    queryFn: async () => {
      const response = await fetch(`/api/persona/extended-analysis?sampleSize=${sampleSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch persona analysis');
      }
      return response.json();
    },
    enabled: true
  });

  // Fetch investor prospects
  const { data: investorData, isLoading: investorLoading } = useQuery({
    queryKey: ['/api/persona/investor-prospects'],
    queryFn: async () => {
      const response = await fetch('/api/persona/investor-prospects');
      if (!response.ok) {
        throw new Error('Failed to fetch investor prospects');
      }
      return response.json();
    },
    enabled: true
  });

  const handleAnalyze = () => {
    refetchAnalysis();
  };

  if (analysisLoading || investorLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyzing Email Personas...</CardTitle>
              <CardDescription>Processing {sampleSize} email contacts for comprehensive persona insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={65} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">Identifying potential investors and categorizing contacts...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const analysis = (analysisData as any)?.analysis;
  const investorInsights = (investorData as any)?.insights;
  
  if (!analysis) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Persona Analysis</CardTitle>
            <CardDescription>Analyze 100+ emails to identify target personas and potential investors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Sample Size</label>
                <Input
                  type="number"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  min="50"
                  max="500"
                  placeholder="Number of emails to analyze"
                />
              </div>
              <Button onClick={handleAnalyze} className="mt-6">
                Start Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const personas: PersonaInsight[] = analysis.personas || [];
  const potentialInvestors: InvestorProfile[] = analysis.potentialInvestors || [];
  const recommendations: string[] = analysis.recommendations || [];

  // Filter personas based on search and category
  const filteredPersonas = personas.filter(persona => {
    const matchesSearch = persona.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         persona.keyCharacteristics.some(char => char.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || persona.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter high-value investors (confidence > 60%)
  const highConfidenceInvestors = potentialInvestors.filter(inv => inv.confidence > 60);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Persona Analysis</h2>
          <p className="text-muted-foreground">
            Analyzed {analysis.totalAnalyzed} contacts • Found {potentialInvestors.length} potential investors
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="px-3 py-1">
            {personas.length} Personas Identified
          </Badge>
          <Button onClick={handleAnalyze} size="sm">
            Re-analyze
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.totalAnalyzed}</div>
            <div className="text-xs text-muted-foreground">Email contacts processed</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Potential Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{potentialInvestors.length}</div>
            <div className="text-xs text-muted-foreground">{highConfidenceInvestors.length} high confidence</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High-Value Personas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {personas.filter(p => p.avgRevenuePotential > 10000).length}
            </div>
            <div className="text-xs text-muted-foreground">$10K+ revenue potential</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(personas.reduce((sum, p) => sum + p.avgRevenuePotential, 0) / personas.length).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Per persona category</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personas">Persona Insights</TabsTrigger>
          <TabsTrigger value="investors">Investor Prospects</TabsTrigger>
          <TabsTrigger value="recommendations">Strategic Recommendations</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="personas" className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search personas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              {personas.map(p => p.category).filter((category, index, self) => self.indexOf(category) === index).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Persona Cards */}
          <div className="grid gap-4">
            {filteredPersonas.map((persona, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{persona.category}</CardTitle>
                        <CardDescription>{persona.count} contacts identified</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={riskColors[persona.riskProfile]}>
                        {persona.riskProfile} risk
                      </Badge>
                      <Badge variant="outline">
                        ${persona.avgRevenuePotential.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-blue-600" />
                        Key Characteristics
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {persona.keyCharacteristics.map((char, charIndex) => (
                          <li key={charIndex}>{char}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-green-600" />
                        Communication Preferences
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {persona.communicationPreferences.map((pref, prefIndex) => (
                          <li key={prefIndex}>{pref}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Conversion: {persona.timeToConversion}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Avg Value: ${persona.avgRevenuePotential.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {persona.examples.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Example Contacts:</h4>
                      <div className="space-y-1">
                        {persona.examples.slice(0, 2).map((example, exampleIndex) => (
                          <div key={exampleIndex} className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                            <div className="font-mono">{example.email}</div>
                            {example.company && <div className="text-xs">{example.company}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="investors" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>High-Confidence Investor Prospects</span>
                </CardTitle>
                <CardDescription>
                  Investors with 60%+ confidence score based on email patterns and keywords
                </CardDescription>
              </CardHeader>
              <CardContent>
                {highConfidenceInvestors.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                    <p>No high-confidence investors found in current sample</p>
                    <p className="text-xs">Try increasing sample size or expanding email database</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {highConfidenceInvestors.map((investor, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Building2 className="h-5 w-5 text-primary" />
                              <div>
                                <h4 className="font-medium">{investor.name}</h4>
                                <p className="text-sm text-muted-foreground">{investor.company}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Focus:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {investor.investmentFocus.map((focus, focusIndex) => (
                                    <Badge key={focusIndex} variant="secondary" className="text-xs">
                                      {focus}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Check Size:</span>
                                <p className="font-medium">{investor.checkSize}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={investorTypeColors[investor.type]}>
                              {investor.type.toUpperCase()}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <div className="text-sm font-medium">{investor.confidence}%</div>
                              <div className="text-xs text-muted-foreground">confidence</div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{investor.email}</span>
                            <span className="text-muted-foreground">{investor.geography}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Potential Investors */}
            <Card>
              <CardHeader>
                <CardTitle>All Potential Investors ({potentialInvestors.length})</CardTitle>
                <CardDescription>Complete list sorted by confidence score</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {potentialInvestors.map((investor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{investor.name}</div>
                          <div className="text-sm text-muted-foreground">{investor.email}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={investorTypeColors[investor.type]} variant="outline">
                            {investor.type}
                          </Badge>
                          <div className="text-sm font-medium">{investor.confidence}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Strategic Recommendations</span>
              </CardTitle>
              <CardDescription>
                AI-generated insights based on persona analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">{recommendation}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Potential Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personas.slice(0, 8).map((persona, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{persona.category}</span>
                        <span className="font-medium">${persona.avgRevenuePotential.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={Math.min((persona.avgRevenuePotential / 25000) * 100, 100)} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Profile Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['low', 'medium', 'high'].map(risk => {
                    const count = personas.filter(p => p.riskProfile === risk).length;
                    const percentage = Math.round((count / personas.length) * 100);
                    return (
                      <div key={risk} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={riskColors[risk as keyof typeof riskColors]}>
                            {risk} risk
                          </Badge>
                          <span className="text-sm">{count} personas</span>
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}