import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Upload, Award, CheckCircle, Clock, XCircle, FileText, Globe, Smartphone, Share2, Map, Coins, TrendingUp } from "lucide-react";
import { MiniKit, ResponseEvent } from '@worldcoin/minikit-js';

// Extend Window interface for MiniKit global (fallback for CDN loading)
declare global {
  interface Window {
    MiniKit: typeof MiniKit;
    WorldApp: any; // Set by World App when mini app is opened
  }
}

interface MobilityUser {
  id: string;
  worldId: string;
  displayName?: string;
  email?: string;
  verifiedAt: string;
}

interface MobilityCredential {
  id: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  ai_score?: number;
  verified_at?: string;
  rejected_reason?: string;
  created_at: string;
}

interface MobilityScore {
  composite_score: number;
  components?: {
    credentials?: number;
    verifications?: number;
    engagement?: number;
  };
  last_calculated_at: string;
}

interface WldReward {
  id: string;
  amount: string;
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  tx_hash?: string;
  created_at: string;
}

interface WldRewards {
  balance: number;
  transactions: WldReward[];
}

export default function MobilityDashboard() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<MobilityUser | null>(null);
  const [selectedCredentialType, setSelectedCredentialType] = useState<string>("passport");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkTimeout, setSdkTimeout] = useState(false);

  // Initialize MiniKit - ONLY works inside World App (mini app context)
  // World App injects window.MiniKit automatically - we just wait for it
  useEffect(() => {
    console.log('🚀 [INIT] Starting World App detection...');
    
    // DON'T try to load SDK from CDN - it won't work outside World App
    // World App provides the SDK automatically when running as a mini app

    let attempts = 0;
    const maxAttempts = 30; // 30 attempts over ~45 seconds
    let detectionTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const checkWorldApp = async (): Promise<boolean> => {
      attempts++;
      console.log(`🔍 [ATTEMPT ${attempts}/${maxAttempts}] Checking World App environment...`);
      
      try {
        // Step 1: Check if we're inside World App
        const hasWorldAppObject = typeof window.WorldApp !== 'undefined' && window.WorldApp;
        const userAgent = navigator.userAgent || '';
        const isWorldAppUA = userAgent.includes('WorldApp') || userAgent.includes('MiniKit');
        const isInWorldApp = hasWorldAppObject || isWorldAppUA;
        
        console.log(`📱 [ENV] World App check:`, {
          hasWorldAppObject,
          isWorldAppUA,
          userAgent: userAgent.substring(0, 50) + '...',
          isInWorldApp
        });
        
        // If NOT in World App, stop checking
        if (!isInWorldApp) {
          console.log('⚠️ [NOT_WORLD_APP] Not running in World App - verification unavailable');
          setIsMiniApp(false);
          setSdkReady(false);
          return true; // Stop retrying
        }
        
        // Step 2: We're in World App - check if MiniKit SDK is ready
        const hasMiniKit = typeof window.MiniKit !== 'undefined' && window.MiniKit;
        
        if (!hasMiniKit) {
          console.log(`⏳ [WAITING] World App detected, waiting for MiniKit SDK injection...`);
          if (attempts >= maxAttempts) {
            console.error('❌ [TIMEOUT] MiniKit SDK never loaded in World App');
            setIsMiniApp(true);
            setSdkReady(false);
            setSdkTimeout(true); // Mark as timed out
            return true;
          }
          return false; // Keep waiting
        }
        
        console.log(`✅ [SDK_FOUND] MiniKit object exists:`, {
          type: typeof window.MiniKit,
          hasInstall: typeof window.MiniKit.install === 'function',
          hasCommands: typeof window.MiniKit.commands !== 'undefined',
          hasVerify: typeof window.MiniKit.commands?.verify === 'function'
        });
        
        // Step 3: Install MiniKit (required by World App)
        if (typeof window.MiniKit.install === 'function') {
          try {
            console.log('🔧 [INSTALL] Calling MiniKit.install() with options object...');
            await Promise.race([
              window.MiniKit.install({ 
                appId: 'app_f0adeaeec4971994facf4c0be33a878f'
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Install timeout after 10s')), 10000))
            ]);
            console.log('✅ [INSTALL] MiniKit.install() completed successfully');
          } catch (installError) {
            console.error('❌ [INSTALL] Failed:', installError);
            console.error('❌ [INSTALL] Error details:', {
              message: installError instanceof Error ? installError.message : String(installError),
              stack: installError instanceof Error ? installError.stack : undefined
            });
            // If install fails, we can't proceed
            if (attempts >= maxAttempts) {
              setIsMiniApp(true);
              setSdkReady(false);
              setSdkTimeout(true);
              return true; // Stop retrying
            }
            return false; // Keep retrying
          }
        }
        
        // Step 4: Check if commands.verify is now available
        const hasVerifyCommand = typeof window.MiniKit.commands?.verify === 'function';
        
        console.log(`🎯 [VERIFY_CHECK] Commands ready:`, {
          hasCommands: typeof window.MiniKit.commands !== 'undefined',
          hasVerify: hasVerifyCommand
        });
        
        if (hasVerifyCommand) {
          console.log('✅ [READY] MiniKit SDK fully ready - enabling verification!');
          setIsMiniApp(true);
          setSdkReady(true);
          return true; // Success!
        }
        
        // Step 5: Not ready yet, keep waiting
        if (attempts >= maxAttempts) {
          console.error('❌ [TIMEOUT] MiniKit commands.verify never became available');
          console.error('🔍 [DEBUG] Final state:', {
            MiniKit: typeof window.MiniKit,
            commands: typeof window.MiniKit?.commands,
            verify: typeof window.MiniKit?.commands?.verify
          });
          setIsMiniApp(true);
          setSdkReady(false);
          setSdkTimeout(true); // Mark as timed out
          return true; // Stop retrying
        }
        
        console.log(`⏳ [WAITING] Commands not ready yet, will retry...`);
        return false; // Keep waiting
        
      } catch (error) {
        console.error(`❌ [ERROR] Detection failed:`, error);
        
        if (attempts >= maxAttempts) {
          console.error('❌ [TIMEOUT] Max attempts reached with errors');
          setIsMiniApp(false);
          setSdkReady(false);
          return true;
        }
        
        return false; // Keep retrying
      }
    };
    
    const scheduleNextCheck = () => {
      if (detectionTimeout) clearTimeout(detectionTimeout);
      
      checkWorldApp().then((shouldStop) => {
        if (!shouldStop && attempts < maxAttempts) {
          // Progressive delays: 500ms → 1s → 2s
          const delay = attempts <= 5 ? 500 : attempts <= 15 ? 1000 : 2000;
          detectionTimeout = setTimeout(scheduleNextCheck, delay);
        }
      });
    };
    
    // Start checking after brief delay
    detectionTimeout = setTimeout(scheduleNextCheck, 200);
    
    return () => {
      if (detectionTimeout) clearTimeout(detectionTimeout);
    };
  }, []);

  // Auto-login for returning users (check localStorage on page load)
  useEffect(() => {
    const savedWorldId = localStorage.getItem('mobility_worldId');
    console.log('🔍 Auto-login check:', { savedWorldId, hasCurrentUser: !!currentUser });
    
    if (savedWorldId && !currentUser) {
      console.log('🔄 Attempting auto-login with saved worldId...', savedWorldId);
      // Auto-fetch user profile for returning users
      fetch(`/api/mobility/me?worldId=${encodeURIComponent(savedWorldId)}`)
        .then(res => {
          console.log('📊 Auto-login HTTP status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('📊 Auto-login response:', data);
          if (data.success && data.user) {
            setCurrentUser(data.user);
            console.log('✅ Auto-logged in returning user:', data.user.id);
          } else {
            console.log('❌ Auto-login failed:', data);
            // Don't clear - user might just need to refresh
          }
        })
        .catch((err) => {
          console.error('❌ Auto-login error:', err);
          // Don't clear - user might just need to refresh
        });
    } else if (!savedWorldId) {
      console.log('⚠️ No saved worldId found - user needs to verify');
    } else if (currentUser) {
      console.log('✅ Already logged in:', currentUser.id);
    }
  }, [currentUser]);

  // Fetch user data when verified
  const { data: userData, refetch: refetchUser } = useQuery({
    queryKey: ['/api/mobility/me', currentUser?.worldId],
    queryFn: async () => {
      if (!currentUser?.worldId) return null;
      const response = await fetch(`/api/mobility/me?worldId=${currentUser.worldId}`);
      const result = await response.json();
      return result.success ? result : null;
    },
    enabled: !!currentUser?.worldId,
  });

  // Reset mobility data - delete everything and start fresh
  const resetMobilityData = useMutation({
    mutationFn: async () => {
      const savedWorldId = localStorage.getItem('mobility_worldId');
      if (!savedWorldId) {
        throw new Error('No WorldID found to reset');
      }

      const response = await fetch(`/api/mobility/reset?worldId=${encodeURIComponent(savedWorldId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Reset failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Clear local storage
      localStorage.removeItem('mobility_worldId');
      
      // Clear current user state
      setCurrentUser(null);
      
      toast({
        title: "✅ Data Reset Complete",
        description: data.message || "You can now verify again with a fresh start!",
      });
      
      // Reload page to reset state
      setTimeout(() => window.location.reload(), 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  // WorldID verification via MiniKit (World App) - triggered by button click
  const verifyWithMiniKit = useMutation({
    mutationFn: async () => {
      console.log('🚀 [VERIFY START] Initiating WorldID verification...');
      
      // Get action from environment (must match World Developer Portal)
      const action = import.meta.env.VITE_WLD_ACTION || 'verify-human';

      // RESTORED WORKING CODE: Use subscribe + commands pattern (not commandsAsync)
      // World App's MiniKit uses the subscribe/command pattern, not async/await
      
      // CRITICAL: Validate SDK is ready before attempting verification
      if (!window.MiniKit?.commands?.verify) {
        console.error('🔴 [SDK ERROR] MiniKit SDK not loaded or commands not ready');
        console.error('🔍 [DEBUG] window.MiniKit:', typeof window.MiniKit);
        console.error('🔍 [DEBUG] window.MiniKit.commands:', typeof window.MiniKit?.commands);
        console.error('🔍 [DEBUG] window.MiniKit.commands.verify:', typeof window.MiniKit?.commands?.verify);
        
        throw new Error(
          'World ID SDK not ready. ' +
          'The verification system is still initializing. ' +
          'Please wait a few seconds and try again, or close and reopen the mini app.'
        );
      }

      console.log('🚀 [VERIFY START] Initiating WorldID verification...');

      // Create a promise that will resolve when MiniKit responds
      return new Promise((resolve, reject) => {
        // Subscribe to verification responses using official ResponseEvent constant
        const unsubscribe = window.MiniKit.subscribe(
          ResponseEvent.MiniAppVerifyAction,
          async (response: any) => {
            console.log('📦 [RAW RESPONSE]', JSON.stringify(response, null, 2));
            
            try {
              // Unsubscribe immediately to prevent multiple calls
              unsubscribe();

              // Check if error
              if (response.status === 'error') {
                console.error('❌ [ERROR]', response);
                reject(new Error(response.error_message || 'Verification failed'));
                return;
              }

              // Extract data
              const payload = response;
              console.log('📦 [PAYLOAD]', JSON.stringify(payload, null, 2));

              if (!payload.nullifier_hash) {
                console.error('🔴 [NO NULLIFIER]', payload);
                reject(new Error('Invalid WorldID response: missing nullifier_hash'));
                return;
              }

              // Check if user already exists
              console.log('🔍 Checking if user already exists...');
              const checkResponse = await fetch(`/api/mobility/me?worldId=${encodeURIComponent(payload.nullifier_hash)}`);
              const checkData = await checkResponse.json();
              
              console.log('📊 Check response:', { status: checkResponse.status, data: checkData });
              
              if (checkResponse.ok && checkData.success && checkData.user) {
                console.log('✅ User already exists, auto-logging in...');
                resolve(checkData);
                return;
              }

              // New user - verify with backend
              console.log('🔵 [CLIENT] New user, proceeding with verification...');
              const verifyResponse = await fetch('/api/mobility/worldid/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  proof: payload.proof,
                  merkle_root: payload.merkle_root,
                  nullifier_hash: payload.nullifier_hash,
                  verification_level: payload.verification_level,
                  action,
                  signal: '',
                }),
              });
              
              // Add null checking before accessing response
              if (!verifyResponse) {
                console.error('❌ Verification response is undefined');
                reject(new Error('Verification response is undefined'));
                return;
              }

              const verifyData = await verifyResponse.json();
              
              // Validate response data exists
              if (!verifyData) {
                console.error('❌ Verification data is undefined');
                reject(new Error('Verification data is undefined'));
                return;
              }
              
              // Handle "already verified" error
              if (!verifyResponse.ok && verifyData.error?.includes('already been verified')) {
                const retryResponse = await fetch(`/api/mobility/me?worldId=${encodeURIComponent(payload.nullifier_hash)}`);
                const retryData = await retryResponse.json();
                if (retryResponse.ok && retryData.success) {
                  resolve(retryData);
                  return;
                }
              }
              
              resolve(verifyData);
            } catch (error) {
              reject(error);
            }
          }
        );

        // Trigger the verification modal
        console.log('🎯 [TRIGGER] Calling window.MiniKit.commands.verify...');
        window.MiniKit.commands.verify({
          action,
          signal: '',
          verification_level: 'device',
        });
      });
    },
    onSuccess: (data) => {
      console.log('✅ Verification onSuccess called');
      
      // Add null checking before accessing data
      if (!data) {
        console.error('❌ Verification response data is undefined');
        toast({
          title: "Verification Error",
          description: "No response received from verification. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('📊 Full response:', JSON.stringify(data, null, 2));
      
      // Backend returns { success, user, score, credentials, wldRewards }
      // NOT { success, user, mobilityScore }
      if (data.success && data.user) {
        const worldId = data.user.worldId || data.user.world_id_nullifier;
        console.log('💾 User found:', { 
          userId: data.user.id, 
          worldId,
          hasScore: !!data.score
        });
        
        // Set current user FIRST to trigger re-render
        setCurrentUser(data.user);
        console.log('✅ setCurrentUser called');
        
        // Save worldId to localStorage for auto-login on return visits
        localStorage.setItem('mobility_worldId', worldId);
        console.log('✅ Saved to localStorage');
        
        // Get mobility score - two formats:
        // 1. Verification endpoint: data.mobilityScore (flat)
        // 2. Me endpoint: data.score.compositeScore (nested)
        const mobilityScore = data.mobilityScore || data.score?.compositeScore || data.score?.composite_score || 100;
        console.log('📊 Mobility score:', mobilityScore);
        
        // Show reward notification if earned
        if (data.reward) {
          toast({
            title: data.reward.message,
            description: `Welcome! Your mobility score: ${mobilityScore}`,
          });
        } else {
          toast({
            title: "✅ WorldID Verified!",
            description: `Welcome! Your mobility score: ${mobilityScore}`,
          });
        }
        
        // Refetch user data to ensure dashboard has latest data
        console.log('🔄 Refetching user data...');
        setTimeout(() => {
          refetchUser();
          console.log('✅ User data refetch triggered');
        }, 100);
      } else {
        console.error('🔴 [CLIENT] Verification response missing user data');
        console.error('🔴 [CLIENT] Full response data:', JSON.stringify(data, null, 2));
        console.error('🔴 [CLIENT] success:', data.success, '| user exists:', !!data.user);
        
        // Provide more specific error message based on what's missing
        let errorMessage = "Verification completed but user data is missing.";
        if (!data.success) {
          errorMessage = data.error || "Verification failed on the server.";
        } else if (!data.user) {
          errorMessage = "Server couldn't create your user account. Check the console for details.";
        }
        
        toast({
          title: "Verification Issue",
          description: errorMessage + " Try the Reset button below or contact support.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Unable to verify your WorldID. Please try again.",
        variant: "destructive",
      });
    },
  });


  // Credential upload mutation
  const uploadCredential = useMutation({
    mutationFn: async ({ userId, type, fileData, fileName }: any) => {
      const response = await fetch('/api/mobility/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, fileData, fileName }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "📄 Credential Uploaded!",
        description: "Your credential is being verified by AI...",
      });
      setUploadFile(null);
      refetchUser();
      setTimeout(() => refetchUser(), 3000);
    },
  });

  const handleFileUpload = async () => {
    if (!uploadFile || !currentUser) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        uploadCredential.mutate({
          userId: currentUser.id,
          type: selectedCredentialType,
          fileData: reader.result as string,
          fileName: uploadFile.name,
        });
      };
      reader.onerror = () => {
        toast({
          title: "Upload Failed",
          description: "Failed to read file. Please try again.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(uploadFile);
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    }
  };

  // Share credential mutation
  const shareCredential = useMutation({
    mutationFn: async ({ credentialId }: { credentialId: string }) => {
      const response = await fetch(`/api/mobility/credentials/${credentialId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInDays: 30 }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        const shareUrl = data.share.shareUrl;
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Share Link Created",
          description: "Link copied to clipboard! Share expires in 30 days.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Share Failed",
        description: error?.message || "Failed to create share link",
        variant: "destructive",
      });
    }
  });

  // Fetch country opportunities based on mobility score
  const { data: opportunities } = useQuery({
    queryKey: ['/api/mobility/opportunities', userData?.user?.id],
    enabled: !!userData?.user?.id && !!userData?.score,
    queryFn: async () => {
      const response = await fetch(`/api/mobility/opportunities?userId=${userData?.user?.id}`);
      return response.json();
    },
  });

  // Fetch WLD rewards
  const { data: rewards, refetch: refetchRewards } = useQuery({
    queryKey: ['/api/mobility/rewards', userData?.user?.id],
    enabled: !!userData?.user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/mobility/rewards?userId=${userData?.user?.id}`);
      return response.json();
    },
  });

  // Claim WLD reward mutation
  const claimReward = useMutation({
    mutationFn: async (rewardId: string) => {
      const response = await fetch(`/api/mobility/rewards/${rewardId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Reward Claimed!",
          description: `Successfully claimed ${data.reward?.amount} WLD`,
        });
        refetchRewards();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Claim Failed",
        description: error?.message || "Failed to claim reward",
        variant: "destructive",
      });
    }
  });

  const credentialTypes = [
    { value: "passport", label: "Passport", icon: "🛂", description: "National passport document" },
    { value: "visa", label: "Visa", icon: "✈️", description: "Travel or work visa" },
    { value: "degree", label: "University Degree", icon: "🎓", description: "Bachelor's, Master's, PhD diploma" },
    { value: "employment_letter", label: "Employment Letter", icon: "💼", description: "Proof of employment or offer letter" },
    { value: "certificate", label: "Professional Certificate", icon: "📜", description: "Technical or professional certification" },
    { value: "license", label: "Professional License", icon: "⚖️", description: "Legal, medical, or professional license" },
    { value: "language_certificate", label: "Language Certificate", icon: "🗣️", description: "TOEFL, IELTS, or other language test" },
    { value: "work_permit", label: "Work Permit", icon: "💼", description: "Employment authorization document" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500" data-testid="badge-verified"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500" data-testid="badge-pending"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" data-testid="badge-rejected"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Verification screen for non-authenticated users
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              JustiGuide Mobility ID
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Your Global Mobility Passport
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* MiniApp Status */}
            <div className={`border rounded-lg p-3 ${isMiniApp ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center space-x-2">
                <Smartphone className={`w-5 h-5 ${isMiniApp ? 'text-green-600' : 'text-yellow-600'}`} />
                <span className={`text-sm font-medium ${isMiniApp ? 'text-green-900' : 'text-yellow-900'}`}>
                  {isMiniApp ? '✅ Running in World App' : '⚠️ Best viewed in World App'}
                </span>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Privacy-First Verification
              </h3>
              <p className="text-sm text-blue-800">
                WorldID uses zero-knowledge proofs. Your biometric data never leaves your device, 
                ensuring complete privacy while proving you're human.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">What you get:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Start with 100-point mobility score</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Upload credentials to boost your score up to 1000</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>AI-verified documents for trusted mobility profile</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Connect with immigration lawyers worldwide</span>
                </li>
              </ul>
            </div>


            {/* Verify Button - PERMISSIVE MODE: Always enable after SDK initialization */}
            {sdkReady ? (
              <div className="space-y-3">
                <Button 
                  onClick={() => verifyWithMiniKit.mutate()}
                  disabled={verifyWithMiniKit.isPending}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  data-testid="button-worldid-verify"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  {verifyWithMiniKit.isPending ? 'Verifying...' : 'Verify with World ID'}
                </Button>
                {!isMiniApp && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-yellow-900 mb-1">⚠️ Best Experience in World App</p>
                    <p className="text-xs text-yellow-800">
                      For optimal verification, open this in World App on your mobile device.
                    </p>
                  </div>
                )}
              </div>
            ) : sdkTimeout ? (
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.reload()}
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  data-testid="button-sdk-error"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Reload and Try Again
                </Button>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-900 mb-1">❌ SDK Timeout</p>
                  <p className="text-xs text-red-800 mb-2">
                    The verification system couldn't initialize. This usually happens if:
                  </p>
                  <ul className="text-xs text-red-800 list-disc pl-4 space-y-1">
                    <li>You're not using the latest World App version</li>
                    <li>The mini app needs to be reopened</li>
                    <li>Network connectivity issues</li>
                  </ul>
                  <p className="text-xs text-red-800 mt-2">
                    Try closing and reopening the mini app, or tap "Reload and Try Again" above.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  disabled
                  size="lg"
                  className="w-full bg-blue-400 text-white cursor-wait"
                  data-testid="button-sdk-loading"
                >
                  <Shield className="w-5 h-5 mr-2 animate-pulse" />
                  Initializing World ID...
                </Button>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-900 mb-1">⏳ Loading SDK</p>
                  <p className="text-xs text-blue-800">
                    Please wait while we initialize the verification system...
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-center text-gray-500">
              {sdkReady
                ? (isMiniApp ? 'Native verification using World ID' : 'World ID verification ready')
                : 'Initializing verification system...'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = userData?.user;
  const credentials = userData?.credentials || [];
  const score = userData?.score as MobilityScore || { composite_score: 100 };
  const wldRewards = userData?.wldRewards as WldRewards || { balance: 0, transactions: [] };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Mobility ID
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className="bg-green-500 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
              <span className="text-xs text-blue-100" data-testid="text-worldid">
                {user?.worldId?.substring(0, 12)}...
              </span>
            </div>
            {/* WLD Balance */}
            <div className="mt-2 bg-white/20 rounded-lg px-2 py-1 inline-block">
              <span className="text-xs font-semibold" data-testid="text-wld-balance">
                💰 {wldRewards.balance} WLD
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold" data-testid="text-mobility-score">{score.composite_score}</div>
            <div className="text-xs text-blue-100">Score</div>
            <Button
              onClick={() => resetMobilityData.mutate()}
              disabled={resetMobilityData.isPending}
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-red-200 hover:text-red-100 hover:bg-white/10"
              data-testid="button-reset-dashboard"
            >
              {resetMobilityData.isPending ? 'Resetting...' : '🗑️ Reset'}
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 pb-20 space-y-4">
        {/* Score Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium">Credentials</span>
                <span className="text-gray-600" data-testid="text-credentials-score">
                  {score.components?.credentials || 0} pts
                </span>
              </div>
              <Progress value={(score.components?.credentials || 0) / 4} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium">Verifications</span>
                <span className="text-gray-600" data-testid="text-verifications-score">
                  {score.components?.verifications || 0} pts
                </span>
              </div>
              <Progress value={(score.components?.verifications || 0)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium">Engagement</span>
                <span className="text-gray-600" data-testid="text-engagement-score">
                  {score.components?.engagement || 0} pts
                </span>
              </div>
              <Progress value={(score.components?.engagement || 0) / 6} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Upload Credential */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload Credential
            </CardTitle>
            <CardDescription className="text-sm">
              Add documents to boost your score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="credential-type" className="text-sm">Credential Type</Label>
              <Select value={selectedCredentialType} onValueChange={setSelectedCredentialType}>
                <SelectTrigger id="credential-type" data-testid="select-credential-type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {credentialTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file-upload" className="text-sm">Upload File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                data-testid="input-file-upload"
                className="mt-1"
              />
              {uploadFile && (
                <p className="text-xs text-gray-600 mt-1" data-testid="text-filename">
                  {uploadFile.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleFileUpload}
              disabled={!uploadFile || uploadCredential.isPending}
              className="w-full"
              data-testid="button-upload-credential"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadCredential.isPending ? 'Uploading...' : 'Upload & Verify'}
            </Button>
          </CardContent>
        </Card>

        {/* Credentials List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Your Credentials
            </CardTitle>
            <CardDescription className="text-sm">
              {credentials.length} credential{credentials.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {credentials.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No credentials yet</p>
                <p className="text-xs mt-1">Upload your first document above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {credentials.map((cred: MobilityCredential) => (
                  <div
                    key={cred.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-white"
                    data-testid={`credential-${cred.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm capitalize truncate">
                        {cred.type.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(cred.created_at).toLocaleDateString()}
                      </div>
                      {cred.ai_score && (
                        <div className="text-xs text-blue-600 mt-1">
                          AI: {(cred.ai_score * 100).toFixed(0)}%
                        </div>
                      )}
                      {cred.status === 'rejected' && cred.rejected_reason && (
                        <div className="text-xs text-red-600 mt-1" data-testid={`rejection-reason-${cred.id}`}>
                          ❌ {cred.rejected_reason}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {cred.status === 'verified' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => shareCredential.mutate({ credentialId: cred.id })}
                          disabled={shareCredential.isPending}
                          className="h-8 px-2"
                          data-testid={`button-share-${cred.id}`}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      )}
                      {getStatusBadge(cred.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Country Opportunities Section */}
        {mobilityScore && mobilityScore.composite_score >= 300 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Map className="w-5 h-5 mr-2" />
                Country Opportunities
              </CardTitle>
              <CardDescription className="text-sm">
                Based on your {mobilityScore.composite_score}-point mobility score
              </CardDescription>
            </CardHeader>
            <CardContent>
              {opportunities?.success && opportunities.opportunities?.length > 0 ? (
                <div className="space-y-3">
                  {opportunities.opportunities.map((opp: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"
                      data-testid={`opportunity-${idx}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-sm flex items-center gap-2">
                            <span className="text-2xl">{opp.flag}</span>
                            {opp.country}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {opp.visaType} - {opp.difficulty}
                          </div>
                          <div className="text-xs text-blue-700 mt-2">
                            {opp.recommendation}
                          </div>
                        </div>
                        <Badge className="bg-green-500">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {opp.eligibilityScore}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Map className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No opportunities yet</p>
                  <p className="text-xs mt-1">Upload more credentials to unlock destinations</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* WLD Rewards Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Coins className="w-5 h-5 mr-2" />
              WLD Rewards
            </CardTitle>
            <CardDescription className="text-sm">
              {rewards?.success ? (
                <>
                  {rewards.summary?.totalEarned || '0'} WLD earned • {rewards.summary?.totalPending || '0'} WLD pending
                </>
              ) : (
                'Earn rewards for completing actions'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rewards?.success && rewards.rewards?.length > 0 ? (
              <div className="space-y-2">
                {rewards.rewards.map((reward: any) => (
                  <div
                    key={reward.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      reward.status === 'completed' ? 'bg-green-50 border-green-200' : 
                      reward.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 
                      'bg-red-50 border-red-200'
                    }`}
                    data-testid={`reward-${reward.id}`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {reward.amount} WLD
                      </div>
                      <div className="text-xs text-gray-600">
                        {reward.reason}
                      </div>
                      {reward.txHash && (
                        <div className="text-xs text-blue-600 mt-1 font-mono truncate max-w-[200px]">
                          {reward.txHash}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {reward.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => claimReward.mutate(reward.id)}
                          disabled={claimReward.isPending}
                          className="h-8 px-3"
                          data-testid={`button-claim-${reward.id}`}
                        >
                          <Coins className="w-3 h-3 mr-1" />
                          Claim
                        </Button>
                      )}
                      {reward.status === 'completed' && (
                        <Badge className="bg-green-500">Claimed</Badge>
                      )}
                      {reward.status === 'failed' && (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Coins className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No rewards yet</p>
                <p className="text-xs mt-1">Complete verifications to earn WLD</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
