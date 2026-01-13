import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  Trophy,
  Medal,
  Award,
  Download,
  TrendingUp
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { toast } from 'sonner';

interface ResellerStats {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  total_transactions: number;
  total_volume: number;
  data_volume: number;
  airtime_volume: number;
}

export default function TopResellersPage() {
  const [resellers, setResellers] = useState<ResellerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('current');

  useEffect(() => {
    fetchTopResellers();
  }, [period]);

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'current':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'all':
        return { start: new Date('2020-01-01'), end: now };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const fetchTopResellers = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();

      // Fetch all completed debit transactions in the period
      const { data: transactions, error: txnError } = await supabase
        .from('transactions')
        .select('user_id, amount, category')
        .eq('status', 'completed')
        .eq('type', 'debit')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (txnError) throw txnError;

      // Aggregate by user
      const userStats = new Map<string, { total: number; count: number; data: number; airtime: number }>();
      
      transactions?.forEach(txn => {
        const current = userStats.get(txn.user_id) || { total: 0, count: 0, data: 0, airtime: 0 };
        current.total += Number(txn.amount);
        current.count += 1;
        if (txn.category === 'data') current.data += Number(txn.amount);
        if (txn.category === 'airtime') current.airtime += Number(txn.amount);
        userStats.set(txn.user_id, current);
      });

      // Get top 50 users by volume
      const topUserIds = Array.from(userStats.entries())
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 50)
        .map(([id]) => id);

      if (topUserIds.length === 0) {
        setResellers([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for these users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone')
        .in('user_id', topUserIds);

      if (profileError) throw profileError;

      // Combine data
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const resellerData: ResellerStats[] = topUserIds.map(userId => {
        const stats = userStats.get(userId)!;
        const profile = profileMap.get(userId);
        return {
          user_id: userId,
          full_name: profile?.full_name || 'Unknown',
          email: profile?.email || '',
          phone: profile?.phone || '',
          total_transactions: stats.count,
          total_volume: stats.total,
          data_volume: stats.data,
          airtime_volume: stats.airtime,
        };
      });

      setResellers(resellerData);
    } catch (error) {
      console.error('Error fetching top resellers:', error);
      toast.error('Failed to load reseller data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Rank', 'Name', 'Email', 'Phone', 'Transactions', 'Total Volume', 'Data Volume', 'Airtime Volume'];
    const rows = resellers.map((r, idx) => [
      idx + 1,
      r.full_name,
      r.email,
      r.phone,
      r.total_transactions,
      r.total_volume,
      r.data_volume,
      r.airtime_volume
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top-resellers-${period}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
    }
  };

  const getPeriodLabel = () => {
    const { start, end } = getDateRange();
    if (period === 'all') return 'All Time';
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Top Resellers</h1>
          <p className="text-gray-500">Leaderboard for reseller promo contest</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">This Month</SelectItem>
              <SelectItem value="last">Last Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500 rounded-full">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-yellow-700">1st Place</p>
                <p className="font-bold text-yellow-900">
                  {resellers[0]?.full_name || 'N/A'}
                </p>
                <p className="text-sm text-yellow-600">
                  ₦{(resellers[0]?.total_volume || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-400 rounded-full">
                <Medal className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">2nd Place</p>
                <p className="font-bold text-gray-900">
                  {resellers[1]?.full_name || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  ₦{(resellers[1]?.total_volume || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-600 rounded-full">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-700">3rd Place</p>
                <p className="font-bold text-amber-900">
                  {resellers[2]?.full_name || 'N/A'}
                </p>
                <p className="text-sm text-amber-600">
                  ₦{(resellers[2]?.total_volume || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Reseller Leaderboard
            </CardTitle>
            <Badge variant="outline">{getPeriodLabel()}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : resellers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transaction data found for this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Reseller</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Data Volume</TableHead>
                    <TableHead className="text-right">Airtime Volume</TableHead>
                    <TableHead className="text-right">Total Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resellers.map((reseller, index) => (
                    <TableRow 
                      key={reseller.user_id}
                      className={index < 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {getRankIcon(index + 1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reseller.full_name}</p>
                          <p className="text-xs text-gray-500">{reseller.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {reseller.phone}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {reseller.total_transactions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-blue-600">
                        ₦{reseller.data_volume.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        ₦{reseller.airtime_volume.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        ₦{reseller.total_volume.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Promo Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p><strong>Total Volume:</strong> Sum of all completed debit transactions (data, airtime, bills, etc.)</p>
          <p><strong>Ranking:</strong> Users are ranked by total transaction volume in the selected period</p>
          <p><strong>Export:</strong> Download the leaderboard as CSV to announce winners</p>
        </CardContent>
      </Card>
    </div>
  );
}
