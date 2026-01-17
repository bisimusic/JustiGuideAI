import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function Survey() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';
  
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [answers, setAnswers] = useState({
    immigrationSituation: '',
    readiness: '',
    biggestConcern: '',
    otherSolutions: '',
    discountPreference: '',
    commitmentTrigger: '',
    otherNeeds: '',
  });

  const isO1ATrack = ['o1a', 'eb1a', 'eb1b', 'eb1-niw'].includes(answers.immigrationSituation);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest('/api/survey-responses', {
        method: 'POST',
        body: JSON.stringify({
          email,
          name,
          ...answers,
          submittedAt: new Date().toISOString(),
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit survey:', error);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Thank You, {name || 'Friend'}!</h2>
            <p className="text-slate-600 mb-6">
              Your feedback is invaluable. We'll use it to build exactly what you need.
            </p>
            <p className="text-sm text-slate-500">
              We'll be in touch soon with exclusive pilot access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">JustiGuide Pilot Survey</h1>
          <p className="text-slate-400">Help us build exactly what you need</p>
          {name && <p className="text-slate-500 text-sm mt-2">Welcome, {name}</p>}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Question {step} of {isO1ATrack ? 6 : 2}</CardTitle>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(step / (isO1ATrack ? 6 : 2)) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">What's your current immigration situation?</h3>
                <RadioGroup 
                  value={answers.immigrationSituation} 
                  onValueChange={(v) => setAnswers({ ...answers, immigrationSituation: v })}
                  className="space-y-3"
                >
                  {[
                    { value: 'o1a', label: 'O1A Extraordinary Ability' },
                    { value: 'eb1a', label: 'EB-1A / EB-1B' },
                    { value: 'eb1-niw', label: 'EB1-NIW (National Interest Waiver)' },
                    { value: 'greencard', label: 'Green Card (other pathway)' },
                    { value: 'h1b', label: 'H1B' },
                    { value: 'other', label: 'Other visa/status' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} data-testid={`radio-${option.value}`} />
                      <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={!answers.immigrationSituation}
                  onClick={() => setStep(2)}
                  data-testid="button-next-1"
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && isO1ATrack && (
              <div>
                <h3 className="text-xl font-semibold mb-4">How ready are you to file your O1A/EB-1 application?</h3>
                <RadioGroup 
                  value={answers.readiness} 
                  onValueChange={(v) => setAnswers({ ...answers, readiness: v })}
                  className="space-y-3"
                >
                  {[
                    { value: 'ready-now', label: 'Ready to file this week (just need the right solution)' },
                    { value: 'ready-2-4-weeks', label: 'Ready to file in 2-4 weeks' },
                    { value: 'researching', label: 'Still researching (1-2 months out)' },
                    { value: 'exploring', label: 'Just exploring options' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} data-testid={`radio-${option.value}`} />
                      <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} data-testid="button-back-2">Back</Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                    disabled={!answers.readiness}
                    onClick={() => setStep(3)}
                    data-testid="button-next-2"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && !isO1ATrack && (
              <div>
                <h3 className="text-xl font-semibold mb-4">What would you like JustiGuide to provide for you?</h3>
                <p className="text-slate-600 mb-4">Tell us what immigration service would be most valuable to you.</p>
                <Textarea 
                  placeholder="Share your immigration needs, challenges, or what service would help you most..."
                  value={answers.otherNeeds}
                  onChange={(e) => setAnswers({ ...answers, otherNeeds: e.target.value })}
                  className="min-h-[150px]"
                  data-testid="textarea-other-needs"
                />
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} data-testid="button-back-other">Back</Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                    disabled={!answers.otherNeeds}
                    onClick={handleSubmit}
                    data-testid="button-submit-other"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && isO1ATrack && (
              <div>
                <h3 className="text-xl font-semibold mb-4">What's your biggest concern about the O1A/EB-1 process?</h3>
                <RadioGroup 
                  value={answers.biggestConcern} 
                  onValueChange={(v) => setAnswers({ ...answers, biggestConcern: v })}
                  className="space-y-3"
                >
                  {[
                    { value: 'cost', label: 'Cost (traditional lawyers are too expensive)' },
                    { value: 'time', label: 'Time (process takes too long)' },
                    { value: 'complexity', label: 'Complexity (don\'t know where to start)' },
                    { value: 'approval-odds', label: 'Approval odds (worried about rejection)' },
                    { value: 'documents', label: 'Document preparation (overwhelming paperwork)' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} data-testid={`radio-${option.value}`} />
                      <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} data-testid="button-back-3">Back</Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                    disabled={!answers.biggestConcern}
                    onClick={() => setStep(4)}
                    data-testid="button-next-3"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && isO1ATrack && (
              <div>
                <h3 className="text-xl font-semibold mb-4">What other solutions have you looked at?</h3>
                <p className="text-slate-600 mb-4">Enter any solutions you've explored — lawyers, platforms, DIY resources, etc.</p>
                <Textarea 
                  placeholder="E.g., Traditional lawyer, Boundless, SimpleCitizen, employer attorney, DIY, specific law firm names..."
                  value={answers.otherSolutions}
                  onChange={(e) => setAnswers({ ...answers, otherSolutions: e.target.value })}
                  className="min-h-[120px]"
                  data-testid="textarea-solutions"
                />
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(3)} data-testid="button-back-4">Back</Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                    disabled={!answers.otherSolutions}
                    onClick={() => setStep(5)}
                    data-testid="button-next-4"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && isO1ATrack && (
              <div>
                <h3 className="text-xl font-semibold mb-4">What discount would make this a no-brainer for you?</h3>
                <RadioGroup 
                  value={answers.discountPreference} 
                  onValueChange={(v) => setAnswers({ ...answers, discountPreference: v })}
                  className="space-y-3"
                >
                  {[
                    { value: '50-off', label: '50% off' },
                    { value: '60-off', label: '60% off' },
                    { value: '70-off', label: '70% off' },
                    { value: '80-off', label: '80% off (pilot pricing)' },
                    { value: 'quality-matters', label: 'Price isn\'t the main factor — speed/quality matters more' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} data-testid={`radio-${option.value}`} />
                      <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(4)} data-testid="button-back-5">Back</Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                    disabled={!answers.discountPreference}
                    onClick={() => setStep(6)}
                    data-testid="button-next-5"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 6 && isO1ATrack && (
              <div>
                <h3 className="text-xl font-semibold mb-4">What would guarantee your commitment this week?</h3>
                <RadioGroup 
                  value={answers.commitmentTrigger} 
                  onValueChange={(v) => setAnswers({ ...answers, commitmentTrigger: v })}
                  className="space-y-3"
                >
                  {[
                    { value: 'money-back', label: 'Money-back guarantee if not approved' },
                    { value: 'payment-plan', label: 'Payment plan option' },
                    { value: 'founder-access', label: 'Direct access to the founding team' },
                    { value: 'success-stories', label: 'Success stories from similar cases' },
                    { value: 'attorney-included', label: 'Attorney review included at no extra cost' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} data-testid={`radio-${option.value}`} />
                      <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(5)} data-testid="button-back-6">Back</Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                    disabled={!answers.commitmentTrigger || isSubmitting}
                    onClick={handleSubmit}
                    data-testid="button-submit"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm">
          Questions? Email us at <a href="mailto:o1a@justiguide.com" className="text-purple-400 hover:text-purple-300">o1a@justiguide.com</a>
        </p>
      </div>
    </div>
  );
}
