import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Code, Scale, Users, Shield } from "lucide-react";

export default function UseOfFundsVisual() {
  const totalRaise = 2500000;
  
  const categories = [
    {
      name: "Engineering",
      amount: 1000000,
      percentage: 40,
      color: "bg-blue-500",
      icon: Code,
      items: [
        { name: "Technical Co-founder", amount: 300000 },
        { name: "Senior Engineers (3)", amount: 450000 },
        { name: "Product Infrastructure", amount: 150000 },
        { name: "AI/ML Optimization", amount: 100000 }
      ]
    },
    {
      name: "Legal Operations",
      amount: 750000,
      percentage: 30,
      color: "bg-purple-500",
      icon: Scale,
      items: [
        { name: "Immigration Lawyers (3-4)", amount: 600000 },
        { name: "Legal Case Management", amount: 75000 },
        { name: "Paralegal Support (2)", amount: 75000 }
      ]
    },
    {
      name: "Operations",
      amount: 500000,
      percentage: 20,
      color: "bg-green-500",
      icon: Users,
      items: [
        { name: "Head of Customer Success", amount: 120000 },
        { name: "Lawyer Marketplace Manager", amount: 100000 },
        { name: "Sales Operations (2)", amount: 120000 },
        { name: "Marketing & Growth", amount: 100000 },
        { name: "Office & Admin", amount: 60000 }
      ]
    },
    {
      name: "Legal/Regulatory",
      amount: 250000,
      percentage: 10,
      color: "bg-orange-500",
      icon: Shield,
      items: [
        { name: "Legal Compliance Review", amount: 100000 },
        { name: "State-by-State Licensing", amount: 75000 },
        { name: "E&O Insurance", amount: 50000 },
        { name: "Regulatory Counsel", amount: 25000 }
      ]
    }
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toLocaleString()}K`;
  };

  const milestones = [
    { quarter: "Q1 2025", items: ["Hire 3 immigration lawyers", "Launch D2C N-400 service", "Recruit technical co-founder", "First $1M revenue"], color: "bg-blue-100 dark:bg-blue-900" },
    { quarter: "Q2 2025", items: ["Launch SaaS for law firms", "Onboard 100 lawyer partners", "Launch premium visas", "Reach $5M ARR"], color: "bg-purple-100 dark:bg-purple-900" },
    { quarter: "Q3 2025", items: ["International expansion (Canada)", "Mobile app launch", "200+ cases/month", "Reach $10M ARR"], color: "bg-green-100 dark:bg-green-900" },
    { quarter: "Q4 2025", items: ["200 lawyer partners", "Enterprise API pilots", "Reach $18M ARR", "Series A ready"], color: "bg-orange-100 dark:bg-orange-900" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            Use of Funds
          </h1>
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <p className="text-4xl font-bold text-blue-600">$2.5M SAFE Round</p>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            @ $15M post-money cap • 18-24 months runway
          </p>
        </div>

        {/* Main Chart - Donut Style */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Capital Allocation Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Visual Bars */}
              <div className="space-y-6">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <span className="font-semibold text-lg">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl">{formatCurrency(category.amount)}</div>
                          <div className="text-sm text-gray-500">{category.percentage}%</div>
                        </div>
                      </div>
                      <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 ${category.color} flex items-center justify-center text-white font-semibold transition-all duration-1000`}
                          style={{ width: `${category.percentage}%` }}
                        >
                          {category.percentage >= 15 && `${category.percentage}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pie Chart Alternative - Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card key={category.name} className="border-2 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 space-y-2">
                        <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mb-2`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="font-bold text-2xl">{category.percentage}%</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{category.name}</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(category.amount)}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.name} className="border-2">
                <CardHeader className={`${category.color} text-white`}>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-6 w-6" />
                    {category.name} - {formatCurrency(category.amount)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="font-semibold">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 18-Month Milestones Timeline */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">18-Month Milestones</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">What $2.5M enables</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {milestones.map((milestone, idx) => (
                <Card key={idx} className={`${milestone.color} border-2`}>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">{milestone.quarter}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {milestone.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ROI Summary */}
        <Card className="border-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader>
            <CardTitle className="text-2xl">Return on Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">$8.8M</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">2025 Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">$75M</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">2026 ARR Target</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">200</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cases/Month</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600">15x</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Team Growth</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Stats */}
        <div className="text-center space-y-2 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already Raised: $75,900 from 4 investors
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Target Close: Q1 2025 • Runway: 18-24 months to profitability or Series A
          </p>
        </div>
      </div>
    </div>
  );
}
