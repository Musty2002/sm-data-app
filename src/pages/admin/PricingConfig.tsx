import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
  Loader2,
  Save,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingItem {
  id: string;
  service_type: string;
  network_code: string | null;
  discount_percentage: number;
  markup_percentage: number;
  is_active: boolean;
}

export default function PricingConfig() {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedItems, setEditedItems] = useState<Record<string, Partial<PricingItem>>>({});

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .order('service_type', { ascending: true });

      if (error) throw error;
      setPricing(data || []);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      toast.error('Failed to load pricing configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, field: keyof PricingItem, value: any) => {
    setEditedItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const getDisplayValue = (item: PricingItem, field: keyof PricingItem) => {
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
          .from('pricing_config')
          .update(changes)
          .eq('id', id);

        if (error) throw error;
      }

      toast.success('Pricing updated successfully');
      setEditedItems({});
      fetchPricing();
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const getServiceLabel = (type: string, network: string | null) => {
    if (network) {
      return `${type.charAt(0).toUpperCase() + type.slice(1)} - ${network}`;
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasChanges = Object.keys(editedItems).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Configuration</h1>
          <p className="text-gray-500">Set discounts and markups for services</p>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Service Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Discount (%)</TableHead>
                  <TableHead>Markup (%)</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricing.map((item) => (
                  <TableRow key={item.id} className={editedItems[item.id] ? 'bg-yellow-50' : ''}>
                    <TableCell className="font-medium">
                      {getServiceLabel(item.service_type, item.network_code)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        className="w-24"
                        value={getDisplayValue(item, 'discount_percentage') as number}
                        onChange={(e) => handleChange(item.id, 'discount_percentage', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        className="w-24"
                        value={getDisplayValue(item, 'markup_percentage') as number}
                        onChange={(e) => handleChange(item.id, 'markup_percentage', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={getDisplayValue(item, 'is_active') as boolean}
                        onCheckedChange={(checked) => handleChange(item.id, 'is_active', checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {hasChanges && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              You have unsaved changes. Click "Save Changes" to apply.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p><strong>Discount:</strong> Percentage discount given to users (e.g., 2% discount on airtime means user pays ₦98 for ₦100 airtime)</p>
          <p><strong>Markup:</strong> Percentage added to the base price (e.g., 1.5% markup on electricity means ₦101.50 charged for ₦100 service)</p>
          <p><strong>Active:</strong> Toggle to enable/disable specific services</p>
        </CardContent>
      </Card>
    </div>
  );
}
