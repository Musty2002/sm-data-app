import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ElectricityService {
  id: number;
  product_id: number;
  service: string;
  amount: string;
  name: string;
  category: string;
  available: boolean;
}

export default function Electricity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [providers, setProviders] = useState<ElectricityService[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ElectricityService | null>(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [meterType, setMeterType] = useState<'PREPAID' | 'POSTPAID'>('PREPAID');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('rgc-services', {
        body: { action: 'get-services', serviceType: 'electricity' }
      });

      if (error) throw error;

      if (data.success && data.data) {
        setProviders(data.data.filter((p: ElectricityService) => p.available));
      }
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load electricity providers. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateMeter = async () => {
    if (!meterNumber || !selectedProvider) return;

    setValidating(true);
    setCustomerName(null);

    try {
      const { data, error } = await supabase.functions.invoke('rgc-services', {
        body: {
          action: 'validate',
          serviceType: 'electricity',
          meter_number: meterNumber,
          discoid: selectedProvider.product_id,
          MeterType: meterType,
        }
      });

      if (error) throw error;

      if (data.success && data.data?.Customer_Name) {
        setCustomerName(data.data.Customer_Name);
        toast({
          title: 'Verified!',
          description: `Customer: ${data.data.Customer_Name}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Validation Failed',
          description: data.message || 'Could not verify meter number',
        });
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      toast({
        variant: 'destructive',
        title: 'Validation Failed',
        description: error.message || 'Could not verify meter number',
      });
    } finally {
      setValidating(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProvider || !meterNumber || !amount) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all fields',
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < 500) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Minimum amount is ₦500',
      });
      return;
    }

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('rgc-services', {
        body: {
          action: 'purchase',
          serviceType: 'electricity',
          discoid: selectedProvider.product_id,
          MeterType: meterType,
          meter_number: meterNumber,
          amount: amountNum,
        }
      });

      if (error) throw error;

      if (data.success) {
        const token = data.data?.data?.token || 'Check your meter';
        toast({
          title: 'Success!',
          description: `Electricity token: ${token}`,
        });
        // Reset form
        setMeterNumber('');
        setAmount('');
        setSelectedProvider(null);
        setCustomerName(null);
      } else {
        throw new Error(data.message || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        variant: 'destructive',
        title: 'Purchase Failed',
        description: error.message || 'Unable to complete purchase. Please try again.',
      });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <MobileLayout showNav={false}>
      <div className="safe-area-top">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Electricity Bill</h1>
        </div>

        <div className="px-4 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Provider Selection */}
              <div className="mb-6">
                <Label>Select Provider</Label>
                <Select 
                  value={selectedProvider?.id.toString() || ''} 
                  onValueChange={(value) => {
                    const provider = providers.find(p => p.id.toString() === value);
                    setSelectedProvider(provider || null);
                    setCustomerName(null);
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select electricity provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meter Type */}
              <div className="mb-6">
                <Label className="mb-3 block">Meter Type</Label>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setMeterType('PREPAID');
                      setCustomerName(null);
                    }}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      meterType === 'PREPAID'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <p className="font-medium">Prepaid</p>
                  </button>
                  <button
                    onClick={() => {
                      setMeterType('POSTPAID');
                      setCustomerName(null);
                    }}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      meterType === 'POSTPAID'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <p className="font-medium">Postpaid</p>
                  </button>
                </div>
              </div>

              {/* Meter Number */}
              <div className="mb-6">
                <Label htmlFor="meter">Meter Number</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="meter"
                    placeholder="Enter meter number"
                    value={meterNumber}
                    onChange={(e) => {
                      setMeterNumber(e.target.value);
                      setCustomerName(null);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={validateMeter}
                    disabled={!meterNumber || !selectedProvider || validating}
                  >
                    {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
                {customerName && (
                  <p className="text-sm text-green-600 mt-2">✓ {customerName}</p>
                )}
              </div>

              {/* Amount */}
              <div className="mb-6">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount (min ₦500)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Pay Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchase}
                disabled={!selectedProvider || !meterNumber || !amount || purchasing}
              >
                {purchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay Bill'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
