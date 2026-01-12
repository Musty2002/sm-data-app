import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Loader2,
  Wallet,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

interface WalletWithUser {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
  profiles: {
    full_name: string;
    email: string;
    account_number: string;
  } | null;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const [{ data: wallets }, { data: profiles }] = await Promise.all([
        supabase.from('wallets').select('*').order('balance', { ascending: false }),
        supabase.from('profiles').select('user_id, full_name, email, account_number')
      ]);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const walletsData = wallets?.map(w => ({
        ...w,
        profiles: profileMap.get(w.user_id) || null
      })) || [];

      setWallets(walletsData as WalletWithUser[]);
      setTotalBalance(walletsData.reduce((sum, w) => sum + Number(w.balance), 0));
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWallets = wallets.filter(w => 
    w.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.profiles?.account_number?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallets</h1>
        <p className="text-gray-500">View all user wallet balances</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold">₦{totalBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Wallets</p>
                <p className="text-2xl font-bold">{wallets.filter(w => w.balance > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Balance</p>
                <p className="text-2xl font-bold">₦{wallets.length > 0 ? Math.round(totalBalance / wallets.length).toLocaleString() : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>All Wallets ({wallets.length})</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No wallets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{wallet.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{wallet.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {wallet.profiles?.account_number || '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${wallet.balance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          ₦{Number(wallet.balance).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {format(new Date(wallet.updated_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
