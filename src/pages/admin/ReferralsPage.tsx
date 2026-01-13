import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2,
  Gift,
  Users,
  CheckCircle,
  Clock,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  status: string;
  referrer_bonus: number;
  referee_bonus: number;
  bonus_paid_at: string | null;
  created_at: string;
  referrer?: { full_name: string; email: string };
  referee?: { full_name: string; email: string };
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalBonusPaid: 0
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:profiles!referrals_referrer_id_fkey(full_name, email),
          referee:profiles!referrals_referee_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const referralsData = data || [];
      setReferrals(referralsData);

      // Calculate stats
      const completed = referralsData.filter(r => r.status === 'completed' || r.status === 'bonus_paid');
      setStats({
        total: referralsData.length,
        completed: completed.length,
        pending: referralsData.filter(r => r.status === 'pending').length,
        totalBonusPaid: completed.reduce((sum, r) => 
          sum + Number(r.referrer_bonus || 0) + Number(r.referee_bonus || 0), 0
        )
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (referral: Referral) => {
    setEditingReferral({ ...referral });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingReferral) return;
    
    setSaving(true);
    try {
      const updateData: any = {
        status: editingReferral.status,
        referrer_bonus: editingReferral.referrer_bonus,
        referee_bonus: editingReferral.referee_bonus,
      };

      // Set bonus_paid_at when marking as bonus_paid
      if (editingReferral.status === 'bonus_paid' && !editingReferral.bonus_paid_at) {
        updateData.bonus_paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('referrals')
        .update(updateData)
        .eq('id', editingReferral.id);

      if (error) throw error;

      toast.success('Referral updated successfully');
      setEditDialogOpen(false);
      fetchReferrals();
    } catch (error) {
      console.error('Error updating referral:', error);
      toast.error('Failed to update referral');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'bonus_paid':
        return <Badge className="bg-purple-100 text-purple-800">Bonus Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
        <p className="text-gray-500">Track referral program activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Referrals</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bonus Paid</p>
                <p className="text-2xl font-bold">₦{stats.totalBonusPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Referral History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Referee</TableHead>
                  <TableHead>Referrer Bonus</TableHead>
                  <TableHead>Referee Bonus</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No referrals yet
                    </TableCell>
                  </TableRow>
                ) : (
                  referrals.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ref.referrer?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{ref.referrer?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ref.referee?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{ref.referee?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ₦{Number(ref.referrer_bonus || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ₦{Number(ref.referee_bonus || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(ref.status)}</TableCell>
                      <TableCell className="whitespace-nowrap text-gray-500">
                        {format(new Date(ref.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(ref)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Referral</DialogTitle>
          </DialogHeader>
          {editingReferral && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Referrer</p>
                  <p className="font-medium">{editingReferral.referrer?.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Referee</p>
                  <p className="font-medium">{editingReferral.referee?.full_name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingReferral.status}
                  onValueChange={(value) => setEditingReferral({ ...editingReferral, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="bonus_paid">Bonus Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Referrer Bonus (₦)</Label>
                  <Input
                    type="number"
                    value={editingReferral.referrer_bonus}
                    onChange={(e) => setEditingReferral({ 
                      ...editingReferral, 
                      referrer_bonus: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referee Bonus (₦)</Label>
                  <Input
                    type="number"
                    value={editingReferral.referee_bonus}
                    onChange={(e) => setEditingReferral({ 
                      ...editingReferral, 
                      referee_bonus: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
