import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, FileText, Users, DollarSign, Brain, MessageSquare, Scale, CheckCircle2 } from 'lucide-react';

interface FAQSection {
  icon: any;
  title: string;
  items: { question: string; answer: string }[];
}

export default function LawyerFAQ() {
  const [searchQuery, setSearchQuery] = useState('');

  const sections: FAQSection[] = [
    {
      icon: Users,
      title: 'Lead Screening & Qualification',
      items: [
        {
          question: 'How does JustiGuide screen leads?',
          answer: `Leads go through a comprehensive 5-stage qualification process before reaching our marketplace:

**Stage 1: Initial Assessment**
• AI-powered eligibility questionnaire
• Captures immigration goals, qualifications, timeline
• Screens for basic visa category fit

**Stage 2: Document Verification**
• Validates contact information
• Confirms identity and current immigration status
• Reviews preliminary supporting documents

**Stage 3: Financial Qualification**
• Assesses ability and willingness to pay
• Discusses fee ranges and payment options
• Filters for serious, financially-qualified prospects

**Stage 4: Case Complexity Evaluation**
• Flags potential complications or red flags
• Categorizes case difficulty level
• Identifies special circumstances requiring attention

**Stage 5: Attorney Matching**
• Matches lead to appropriate attorney based on expertise
• Provides attorney with complete case summary
• Lead is now ready for immediate consultation

**Result:** By the time a lead reaches you, they are verified, financially qualified, assessed for case viability, and ready to engage legal services.`,
        },
      ],
    },
    {
      icon: FileText,
      title: 'Visa Categories Offered',
      items: [
        {
          question: 'What types of visas do you offer?',
          answer: `We focus on premium employment-based categories where our platform provides maximum value:

✅ **O-1** (Artists/Professionals/Athletes)
✅ **EB-2 NIW** (National Interest Waiver)
✅ **EB-1A** (Extraordinary Ability)
✅ **Adjustment of Status** (AOS)

These categories represent:
• High-value cases ($8K-$15K attorney fees)
• Strong demand in our lead pipeline
• Significant AI-assistance opportunity
• Clear qualification criteria for our assessment tool

We can expand to other categories (H-1B, L-1, EB-3, family-based) based on your practice preferences and capacity.`,
        },
      ],
    },
    {
      icon: DollarSign,
      title: 'Pricing Structure',
      items: [
        {
          question: 'What pricing do you have in mind for the services?',
          answer: `Our goal is to structure pricing that ensures fair compensation for your legal expertise while maintaining profitability for both parties.

**Current Partnership Model:**
• 60/40 Revenue Split (60% JustiGuide / 40% Attorney)
• Setup Fee: $2,000 (one-time, credited to first 2 cases)
• No monthly fees, no per-lead charges

**Example Pricing:**
• Client pays $10,000 for EB-1A case
• JustiGuide receives: $6,000 (covers all marketing, platform, support)
• Attorney receives: $4,000 (pure legal work, no overhead)

**Why This Works:**
• You eliminate all marketing costs
• Focus 100% on legal work
• Scale to 200+ cases (vs. 50-100 solo)
• Higher total revenue despite lower per-case percentage`,
        },
        {
          question: 'What are postage and printing costs?',
          answer: `All filing costs are included in our per-case fee structure.

**What's Covered:**
✅ Printing of full petition package
✅ Professional binding and assembly
✅ USPS Priority Mail or FedEx shipping to USCIS
✅ Government filing fees charged separately to client

**No Hidden Costs:** You never have to worry about administrative expenses - everything is included in the platform fee.`,
        },
      ],
    },
    {
      icon: Brain,
      title: 'AI Platform Features',
      items: [
        {
          question: 'How do we generate the AI part of the file?',
          answer: `The AI research functionality lives in the Research Section of each case:

**Process:**
1. Open case file in attorney dashboard
2. Navigate to "Research" tab
3. Ask questions in natural language:
   - "What are the requirements for EB-1A in the arts field?"
   - "Generate citation memo for entrepreneur NIW case"
   - "What recent precedents apply to this profile?"
4. AI generates comprehensive research with citations
5. Iterate and refine through conversational interface

**Sources:**
• USCIS Policy Manual
• AAO decisions
• Federal court cases
• Legal precedents
• 1,000+ successful petition examples in our database`,
        },
        {
          question: 'What is the format of output?',
          answer: `**Working Format:** Text-based within the platform (easy editing)
**Final Format:** Compiled PDF when ready to file

**Components:**
• Cover letter
• Beneficiary background
• Criteria analysis (for EB-1A/NIW/O-1)
• Evidence summary
• Legal arguments
• Citation memo`,
        },
        {
          question: 'How do we edit AI output?',
          answer: `Edit directly in chat interface:

1. AI generates initial draft
2. You review in platform
3. Request changes conversationally:
   - "Make the opening paragraph stronger"
   - "Add more emphasis on citations"
   - "Revise the third criterion to focus on judging"
4. AI regenerates with your feedback
5. Repeat until satisfied
6. Export final version

**Philosophy:** The AI is your research assistant and first-draft writer. You have complete editorial control.`,
        },
        {
          question: 'What is the quality of briefs prepared by the system?',
          answer: `Comprehensive and attorney-grade, but always requires attorney review.

**How Quality is Assessed:**

**Benchmark Design:**
• Collaborated with immigration attorneys who have 95%+ approval rates
• Analyzed their most successful petitions
• Identified common elements, structure, and argumentation patterns
• Built quality checklist based on winning petitions

**Quality Metrics:**
1. **Completeness:** All required criteria addressed
2. **Citation Quality:** Proper legal citations and precedent references
3. **Evidence Mapping:** Each claim tied to specific supporting evidence
4. **Argumentation Strength:** Persuasive legal arguments, not just fact recitation
5. **Formatting:** Professional presentation meeting USCIS standards

**Validation Process:**
• Compiler Agent compares final brief against 1,000+ successful applications
• Checklist Verification: Ensures all required documents and arguments included
• Consistency Check: Flags contradictions or gaps
• Citation Audit: Validates all legal references

**Attorney Role:** You're the final quality check. AI provides 80-90% draft; you add the 10-20% that makes it excellent.`,
        },
        {
          question: "Is the system's AI iterating based on feedback? If so, how often?",
          answer: `Yes, continuous learning through reinforcement and evaluation layers.

**Learning Architecture:**

**Microservices Framework:**
• Research Agent: Handles legal research and Q&A (learns from attorney queries)
• Brief Agent: Compiles client data into petition briefs (learns from approved petitions)
• Compiler Agent: Reviews final output against success benchmarks (learns from approvals/denials)

**Training Methodology:**
• Reinforcement Learning: AI improves based on outcome data (approvals/RFEs/denials)
• Evaluation Layer: Human reviewers score AI outputs, feeding back to training
• Attorney Feedback: Your edits and preferences shape future outputs for your workflow

**Update Frequency:**
• Model Updates: Quarterly releases with improved capabilities
• Content Updates: Weekly (new precedents, policy changes)
• Your Custom Workflow: Adapts continuously as you use the system

**Vision:** The AI learns from you and your successful approaches, becoming more aligned with your practice style over time.`,
        },
      ],
    },
    {
      icon: MessageSquare,
      title: 'Communication & Client Management',
      items: [
        {
          question: 'Can petitioner see AI output?',
          answer: `No, not from the attorney dashboard.

**Separation of Interfaces:**
• **Attorney Side:** Full access to AI research, drafts, and work product
• **Client Side:** Cannot see attorney's AI-generated work

**Client Can See:**
• Their own submitted documents
• Communication history with attorney
• Case status updates
• Auto-filled forms (which they can edit)

**Why This Matters:** Protects attorney work product and maintains professional boundary between research/drafting process and final deliverable.`,
        },
        {
          question: 'Can petitioner edit AI output?',
          answer: `Not really - it's informational only.

**What Clients CAN Edit:**
• Auto-filled government forms (I-140, I-129, etc.)
• Their own biographical information
• Document uploads

**What Clients CANNOT Edit:**
• Attorney-generated briefs or legal arguments
• AI research outputs
• Legal strategy documents

**Rationale:** Legal work product remains under attorney control to ensure quality and accuracy.`,
        },
        {
          question: 'How does JustiGuide handle repeated back-and-forth with customers?',
          answer: `Three-layer approach:

**Layer 1: FAQ Automation**
• 1 Million+ Interactions Analyzed
• Templatized Responses: A/B tested responses for most common questions
• Most Helpful Answers: System serves the highest-rated responses automatically
• Domain-Specific AI: Trained specifically on immigration law queries

**Layer 2: Three-Agent Orchestration**
• Agent 1 (Intake): Handles initial client questions and document collection
• Agent 2 (Research): Assists attorney with legal research and brief generation
• Agent 3 (Compliance): Reviews final output against 1,000+ successful petitions

**Layer 3: Ticketing System**
✅ Yes, there is a built-in ticketing interface

**Features:**
• All client-attorney communications in one place
• Thread history maintained
• Document attachments linked to conversations
• Status tracking (Open, Pending, Resolved)
• Search functionality across all tickets

**Email Integration:**
• Platform-First: We prefer all interactions happen on our platform for consistency and logging
• Email Sync (Optional): Can sync platform messages to your email for notifications
• Direct Email (Discouraged but Allowed): You can email clients directly, but it won't be logged in the platform

**Best Practice:** Keep all substantive communications in-platform to maintain complete case record.`,
        },
      ],
    },
    {
      icon: Scale,
      title: 'Document & Petition Management',
      items: [
        {
          question: 'Who prepares the index for petitions?',
          answer: `Attorney prepares the index, but we make it easy:

**Index Compiler Tool:**
1. System tracks all documents uploaded to case
2. Organizes by exhibit category automatically
3. Generates preliminary index based on document types
4. Attorney reviews and finalizes order
5. One-click compilation into formatted index

**Example:**
Exhibit A: Beneficiary Resume
Exhibit B: Letters of Recommendation (1-8)
Exhibit C: Published Articles (1-12)
Exhibit D: Awards and Recognition
Exhibit E: Media Coverage

**Time Savings:** What traditionally takes 2-3 hours takes 15-20 minutes with our compiler.`,
        },
      ],
    },
  ];

  // Filter sections based on search query
  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/lawyers">
            <Button variant="ghost" className="mb-4" data-testid="button-back-lawyers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lawyer Marketplace
            </Button>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent" data-testid="text-title">
              Attorney Partner FAQ
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-subtitle">
              Everything you need to know about partnering with JustiGuide
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-faq"
            />
          </div>
        </div>

        {/* FAQ Sections */}
        {filteredSections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground" data-testid="text-no-results">
                No results found for "{searchQuery}"
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredSections.map((section, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5 text-blue-600" />
                    {section.title}
                  </CardTitle>
                  <CardDescription>
                    {section.items.length} question{section.items.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {section.items.map((item, itemIdx) => (
                      <AccordionItem key={itemIdx} value={`item-${idx}-${itemIdx}`}>
                        <AccordionTrigger 
                          className="text-left hover:text-blue-600"
                          data-testid={`accordion-question-${idx}-${itemIdx}`}
                        >
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div 
                            className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap"
                            data-testid={`accordion-answer-${idx}-${itemIdx}`}
                          >
                            {item.answer}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950 dark:to-violet-950 border-blue-200 dark:border-blue-800">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2" data-testid="text-cta-title">
              Ready to Join Our Network?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Partner with JustiGuide to access pre-qualified leads, AI-powered tools, and scale your immigration law practice.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/lawyers">
                <Button size="lg" data-testid="button-browse-lawyers">
                  Browse Attorney Directory
                </Button>
              </Link>
              <a href="https://calendly.com/bisivc/justiguide-demo?back=1" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" data-testid="button-schedule-demo">
                  Schedule Partnership Demo
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Still have questions? Contact us at{' '}
            <a href="mailto:bisi@justiguide.com" className="text-blue-600 hover:underline">
              bisi@justiguide.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
