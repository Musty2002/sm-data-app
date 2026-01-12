import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Search, 
  Loader2, 
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  category: string;
  amount: number;
  status: string;
  description: string;
  reference: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, categoryFilter]);

  const fetchTransactions = async () => {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter as any);
      }

      const { data, error } = await query.limit(500);
      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(t => t.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const txnsWithProfiles = data?.map(t => ({
        ...t,
        profiles: profileMap.get(t.user_id)
      })) || [];

      setTransactions(txnsWithProfiles as any);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Type', 'Category', 'Amount', 'Status', 'Reference'];
    const rows = transactions.map(t => [
      format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
      t.profiles?.full_name || 'Unknown',
      t.type,
      t.category,
      t.amount,
      t.status,
      t.reference || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500">View all transaction history</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <CardTitle>All Transactions ({transactions.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="airtime">Airtime</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="tv">TV</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(txn.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{txn.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{txn.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {txn.type === 'credit' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className="capitalize">{txn.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{txn.category}</TableCell>
                      <TableCell className={`font-medium ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.type === 'credit' ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(txn.status)}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {txn.reference || '-'}
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
