import { MobileLayout } from '@/components/layout/MobileLayout';
import { Trophy, Star, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ResellerPromo() {
  return (
    <MobileLayout>
      <div className="safe-area-top px-4 py-6">
        <h1 className="text-xl font-bold text-foreground mb-2">Reseller Promo</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Become a top reseller and win amazing rewards!
        </p>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 mb-6">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Best Reseller Contest</h2>
            <p className="text-white/90 text-sm">
              Top resellers this month win cash prizes and exclusive bonuses
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">How to Win</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-card p-4 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Make Transactions</p>
                <p className="text-sm text-muted-foreground">
                  Buy data, airtime, and pay bills to earn points
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-card p-4 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Climb the Leaderboard</p>
                <p className="text-sm text-muted-foreground">
                  Higher transaction volume = higher ranking
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-card p-4 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Win Rewards</p>
                <p className="text-sm text-muted-foreground">
                  Top 3 resellers win cash prizes monthly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
