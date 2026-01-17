import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { CreditCard, ArrowRight, Shield, Zap } from "lucide-react";

export function PaymentCallToAction() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Ready to Get Started?
            </h3>
            <p className="text-blue-700 dark:text-blue-200 mb-4">
              Turn those leads into clients! Professional immigration services starting at $350.
            </p>
            <div className="flex items-center gap-4 text-sm text-blue-600 dark:text-blue-300">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Fast Processing
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Expert Support
              </div>
            </div>
          </div>
          
          <div className="ml-6">
            <Link href="/checkout">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-get-started"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}