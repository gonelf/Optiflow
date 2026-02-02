'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { DollarSign, TrendingDown, CheckCircle2 } from 'lucide-react'

export function SavingsCalculator() {
  const [monthlyVisitors, setMonthlyVisitors] = useState(50000)
  const [teamSize, setTeamSize] = useState(3)

  // Pricing estimates (monthly)
  const webflowCost = 42 + (monthlyVisitors > 100000 ? 84 : 0) // Business plan + CMS add-on for high traffic
  const vwoCost = monthlyVisitors < 10000 ? 0 : monthlyVisitors < 50000 ? 199 : monthlyVisitors < 100000 ? 449 : 799
  const mixpanelCost = monthlyVisitors < 20000 ? 0 : monthlyVisitors < 100000 ? 89 : 299
  const optiVibeCost = monthlyVisitors < 10000 ? 0 : monthlyVisitors < 50000 ? 49 : monthlyVisitors < 100000 ? 99 : 199

  const traditionalStackCost = webflowCost + vwoCost + mixpanelCost
  const monthlySavings = traditionalStackCost - optiVibeCost
  const annualSavings = monthlySavings * 12

  // Time savings calculation (hours per month)
  const integrationMaintenanceHours = 8
  const contextSwitchingHours = teamSize * 10 // 10 hours per person per month
  const totalHoursSaved = integrationMaintenanceHours + contextSwitchingHours
  const dollarValueOfTime = totalHoursSaved * 100 // $100/hour average

  const formatVisitors = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  return (
    <div className="w-full">
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">Calculate Your Savings</h3>
          <p className="text-muted-foreground">See how much you save by switching from Webflow + VWO + Mixpanel</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">
                Monthly Website Visitors
              </label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-primary">{formatVisitors(monthlyVisitors)}</span>
              </div>
              <Slider
                value={[monthlyVisitors]}
                onValueChange={(value) => setMonthlyVisitors(value[0])}
                min={5000}
                max={500000}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5K</span>
                <span>500K</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Marketing Team Size
              </label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-primary">{teamSize} {teamSize === 1 ? 'person' : 'people'}</span>
              </div>
              <Slider
                value={[teamSize]}
                onValueChange={(value) => setTeamSize(value[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>20</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="bg-background/80 rounded-lg p-6 border-2 border-primary">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Monthly Cost Savings</span>
                <TrendingDown className="h-5 w-5 text-primary" />
              </div>
              <div className="text-4xl font-bold text-primary mb-1">
                ${monthlySavings.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>

            <div className="bg-background/80 rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Annual Savings</span>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">
                ${annualSavings.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">per year</div>
            </div>

            <div className="bg-background/80 rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Time Saved</span>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {totalHoursSaved}h
              </div>
              <div className="text-sm text-muted-foreground">
                per month (~${dollarValueOfTime.toFixed(0)} value)
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4 text-center">Cost Breakdown</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium mb-3 text-destructive">Traditional Stack:</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Webflow</span>
                  <span className="font-medium">${webflowCost}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VWO (A/B Testing)</span>
                  <span className="font-medium">${vwoCost}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mixpanel (Analytics)</span>
                  <span className="font-medium">${mixpanelCost}/mo</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total</span>
                  <span className="text-destructive">${traditionalStackCost}/mo</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-3 text-primary">OptiVibe:</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vibe Code Builder</span>
                  <span className="font-medium">✓ Included</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Native A/B Testing</span>
                  <span className="font-medium">✓ Included</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Integrated Analytics</span>
                  <span className="font-medium">✓ Included</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${optiVibeCost}/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
