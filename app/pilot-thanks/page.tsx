import { useEffect, useState } from 'react';
import { CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CALENDAR_LINK = 'https://calendar.app.google/djexEAq5i2Tc8nix8';

export default function PilotThanks() {
  const [name, setName] = useState('');
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setName(params.get('name') || '');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/30">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          You're In{name ? `, ${name}` : ''}! 🎉
        </h1>
        
        <p className="text-xl text-slate-300 mb-8">
          Your pilot spot is reserved. We'll reach out within 24 hours to get you started.
        </p>
        
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">What happens next:</h3>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">1</span>
              </div>
              <p className="text-slate-300">We'll review your profile and confirm pilot eligibility</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">2</span>
              </div>
              <p className="text-slate-300">You'll receive exclusive pilot pricing details</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">3</span>
              </div>
              <p className="text-slate-300">We'll schedule a quick onboarding call</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-slate-400">Want to get started faster?</p>
          <a href={CALENDAR_LINK} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full">
              <Calendar className="w-5 h-5 mr-2" />
              Book Your Onboarding Call Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </div>
        
        <p className="text-slate-500 text-sm mt-12">
          Questions? Email us at <a href="mailto:o1a@justiguide.com" className="text-purple-400 hover:text-purple-300">o1a@justiguide.com</a>
        </p>
      </div>
    </div>
  );
}
