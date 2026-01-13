import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
  Save,
  Database,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface DataBundle {
  id: string;
  network_code: string;
  data_type: string;
  plan_code: string;
  plan_name: string;
  validity: string | null;
  api_price: number;
  app_price: number;
  is_active: boolean;
}

const networks = [
  { code: 'MTN', name: 'MTN' },
  { code: 'AIRTEL', name: 'Airtel' },
  { code: 'GLO', name: 'Glo' },
  { code: '9MOBILE', name: '9Mobile' },
];

const dataTypes = [
  { code: 'SME', name: 'SME' },
  { code: 'CORPORATE', name: 'Corporate Gifting' },
  { code: 'GIFTING', name: 'Gifting' },
  { code: 'DIRECT', name: 'Direct' },
];

export default function DataPricingPage() {
  const [bundles, setBundles] = useState<DataBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [selectedDataType, setSelectedDataType] = useState('SME');
  const [editedItems, setEditedItems] = useState<Record<string, Partial<DataBundle>>>({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newBundle, setNewBundle] = useState({
    plan_code: '',
    plan_name: '',
    validity: '',
    api_price: 0,
    app_price: 0,
  });

  useEffect(() => {
    fetchBundles();
  }, [selectedNetwork, selectedDataType]);

  const fetchBundles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('data_bundles')
        .select('*')
        .eq('network_code', selectedNetwork)
        .eq('data_type', selectedDataType)
        .order('api_price', { ascending: true });

      if (error) throw error;
      setBundles(data || []);
      setEditedItems({});
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Failed to load data bundles');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, field: keyof DataBundle, value: any) => {
    setEditedItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const getDisplayValue = (item: DataBundle, field: keyof DataBundle) => {
    if (editedItems[item.id]?.[field] !== undefined) {
      return editedItems[item.id][field];
    }
    return item[field];
  };

  const saveChanges = async () => {
    if (Object.keys(editedItems).length === 0) {
      toast.info('No changes to save');
      return;
    }

    setSaving(true);
    try {
      for (const [id, changes] of Object.entries(editedItems)) {
        const { error } = await supabase
          .from('data_bundles')
          .update(changes)
          .eq('id', id);

        if (error) throw error;
      }

      toast.success('Prices updated successfully');
      setEditedItems({});
      fetchBundles();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addNewBundle = async () => {
    if (!newBundle.plan_code || !newBundle.plan_name) {
      toast.error('Please fill in plan code and name');
      return;
    }

    try {
      const { error } = await supabase
        .from('data_bundles')
        .insert({
          network_code: selectedNetwork,
          data_type: selectedDataType,
          ...newBundle
        });

      if (error) throw error;

      toast.success('Bundle added successfully');
      setAddDialogOpen(false);
      setNewBundle({ plan_code: '', plan_name: '', validity: '', api_price: 0, app_price: 0 });
      fetchBundles();
    } catch (error: any) {
      console.error('Error adding bundle:', error);
      toast.error(error.message || 'Failed to add bundle');
    }
  };

  const deleteBundle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return;

    try {
      const { error } = await supabase
        .from('data_bundles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Bundle deleted');
      fetchBundles();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete bundle');
    }
  };

  const hasChanges = Object.keys(editedItems).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pricing</h1>
          <p className="text-gray-500">Set prices for data bundles</p>
        </div>
        <Button onClick={saveChanges} disabled={saving || !hasChanges}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="mb-2 block">Network</Label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {networks.map(n => (
                    <SelectItem key={n.code} value={n.code}>{n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="mb-2 block">Data Type</Label>
              <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataTypes.map(t => (
                    <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bundle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Data Bundle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Plan Code</Label>
                      <Input
                        value={newBundle.plan_code}
                        onChange={(e) => setNewBundle(prev => ({ ...prev, plan_code: e.target.value }))}
                        placeholder="e.g., MTN500MB"
                      />
                    </div>
                    <div>
                      <Label>Plan Name</Label>
                      <Input
                        value={newBundle.plan_name}
                        onChange={(e) => setNewBundle(prev => ({ ...prev, plan_name: e.target.value }))}
                        placeholder="e.g., 500MB"
                      />
                    </div>
                    <div>
                      <Label>Validity</Label>
                      <Input
                        value={newBundle.validity}
                        onChange={(e) => setNewBundle(prev => ({ ...prev, validity: e.target.value }))}
                        placeholder="e.g., 30 days"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>API Price (₦)</Label>
                        <Input
                          type="number"
                          value={newBundle.api_price}
                          onChange={(e) => setNewBundle(prev => ({ ...prev, api_price: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>App Price (₦)</Label>
                        <Input
                          type="number"
                          value={newBundle.app_price}
                          onChange={(e) => setNewBundle(prev => ({ ...prev, app_price: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    <Button onClick={addNewBundle} className="w-full">Add Bundle</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            {selectedNetwork} - {dataTypes.find(t => t.code === selectedDataType)?.name} Bundles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : bundles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bundles found. Click "Add Bundle" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Code</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>API Price (₦)</TableHead>
                    <TableHead>App Price (₦)</TableHead>
                    <TableHead>Profit (₦)</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bundles.map((bundle) => {
                    const apiPrice = Number(getDisplayValue(bundle, 'api_price'));
                    const appPrice = Number(getDisplayValue(bundle, 'app_price'));
                    const profit = appPrice - apiPrice;

                    return (
                      <TableRow key={bundle.id} className={editedItems[bundle.id] ? 'bg-yellow-50' : ''}>
                        <TableCell className="font-mono text-sm">{bundle.plan_code}</TableCell>
                        <TableCell className="font-medium">{bundle.plan_name}</TableCell>
                        <TableCell>{bundle.validity || '-'}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-24"
                            value={getDisplayValue(bundle, 'api_price') as number}
                            onChange={(e) => handleChange(bundle.id, 'api_price', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-24"
                            value={getDisplayValue(bundle, 'app_price') as number}
                            onChange={(e) => handleChange(bundle.id, 'app_price', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className={profit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={getDisplayValue(bundle, 'is_active') as boolean}
                            onCheckedChange={(checked) => handleChange(bundle.id, 'is_active', checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteBundle(bundle.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {hasChanges && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              You have unsaved changes. Click "Save Changes" to apply.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p><strong>API Price:</strong> The cost you pay to the provider for this data bundle</p>
          <p><strong>App Price:</strong> The price your users will pay in the app</p>
          <p><strong>Profit:</strong> Difference between App Price and API Price (your margin)</p>
          <p><strong>Active:</strong> Toggle to show/hide bundles from users</p>
        </CardContent>
      </Card>
    </div>
  );
}
