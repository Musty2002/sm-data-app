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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Loader2, 
  Eye, 
  Wallet,
  UserCog,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  account_number: string;
  created_at: string;
  wallet?: { balance: number };
  roles?: { role: string }[];
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [fundDialogOpen, setFundDialogOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundType, setFundType] = useState<'credit' | 'debit'>('credit');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [{ data: profiles }, { data: wallets }, { data: roles }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('wallets').select('user_id, balance'),
        supabase.from('user_roles').select('user_id, role')
      ]);

      const walletMap = new Map(wallets?.map(w => [w.user_id, { balance: Number(w.balance) }]) || []);
      const rolesMap = new Map<string, { role: string }[]>();
      roles?.forEach(r => {
        const existing = rolesMap.get(r.user_id) || [];
        rolesMap.set(r.user_id, [...existing, { role: r.role }]);
      });

      const formattedUsers = profiles?.map(user => ({
        ...user,
        wallet: walletMap.get(user.user_id),
        roles: rolesMap.get(user.user_id) || []
      })) || [];
      
      setUsers(formattedUsers as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = async () => {
    if (!selectedUser || !fundAmount) return;
    setProcessing(true);

    try {
      const amount = parseFloat(fundAmount);
      const currentBalance = selectedUser.wallet?.balance || 0;
      const newBalance = fundType === 'credit' 
        ? currentBalance + amount 
        : currentBalance - amount;

      if (newBalance < 0) {
        toast.error('Insufficient balance for debit');
        return;
      }

      // Update wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', selectedUser.user_id);

      if (walletError) throw walletError;

      // Create transaction record
      const { error: txnError } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedUser.user_id,
          type: fundType,
          category: 'deposit' as const,
          amount,
          status: 'completed',
          description: `Admin ${fundType} - Manual wallet ${fundType === 'credit' ? 'funding' : 'debit'}`,
          reference: `ADMIN-${Date.now()}`
        });

      if (txnError) throw txnError;

      toast.success(`Successfully ${fundType === 'credit' ? 'credited' : 'debited'} ₦${amount.toLocaleString()}`);
      setFundDialogOpen(false);
      setFundAmount('');
      fetchUsers();
    } catch (error) {
      console.error('Error funding wallet:', error);
      toast.error('Failed to update wallet');
    } finally {
      setProcessing(false);
    }
  };

  const toggleAdminRole = async (user: User) => {
    const isAdmin = user.roles?.some(r => r.role === 'admin');
    
    try {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.user_id)
          .eq('role', 'admin');
        
        if (error) throw error;
        toast.success('Admin role removed');
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: user.user_id, role: 'admin' });
        
        if (error) throw error;
        toast.success('Admin role granted');
      }
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery) ||
    user.account_number?.includes(searchQuery)
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
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-500">Manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>All Users ({users.length})</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
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
                  <TableHead>Account No.</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">{user.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{user.account_number}</TableCell>
                      <TableCell className="font-medium">
                        ₦{(user.wallet?.balance || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {user.roles?.some(r => r.role === 'admin') ? (
                          <Badge variant="destructive">Admin</Badge>
                        ) : (
                          <Badge variant="secondary">User</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setFundType('credit');
                              setFundDialogOpen(true);
                            }}>
                              <Wallet className="w-4 h-4 mr-2" />
                              Fund Wallet
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setFundType('debit');
                              setFundDialogOpen(true);
                            }}>
                              <Wallet className="w-4 h-4 mr-2" />
                              Debit Wallet
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleAdminRole(user)}>
                              <UserCog className="w-4 h-4 mr-2" />
                              {user.roles?.some(r => r.role === 'admin') ? 'Remove Admin' : 'Make Admin'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Fund/Debit Dialog */}
      <Dialog open={fundDialogOpen} onOpenChange={setFundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {fundType === 'credit' ? 'Fund' : 'Debit'} Wallet
            </DialogTitle>
            <DialogDescription>
              {fundType === 'credit' ? 'Add funds to' : 'Deduct funds from'} {selectedUser?.full_name}'s wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Balance</Label>
              <p className="text-2xl font-bold">₦{(selectedUser?.wallet?.balance || 0).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFundDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleFundWallet}
              disabled={processing || !fundAmount}
              className={fundType === 'debit' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `${fundType === 'credit' ? 'Fund' : 'Debit'} Wallet`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
