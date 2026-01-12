import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AirtimeService {
  id: number;
  product_id: number;
  service: string;
  name: string | null;
  category: string;
  available: boolean;
}

const networkColors: Record<string, string> = {
  'MTN': 'bg-yellow-400',
  'AIRTEL': 'bg-red-500',
  'GLO': 'bg-green-500',
  '9MOBILE': 'bg-green-700',
};

const quickAmounts = [50, 100, 200, 500, 1000, 2000, 5000, 10000];

export default function Airtime() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [networks, setNetworks] = useState<AirtimeService[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<AirtimeService | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('rgc-services', {
        body: { action: 'get-services', serviceType: 'airtime' }
      });

      if (error) throw error;

      if (data.success && data.data) {
        setNetworks(data.data);
      }
    } catch (error: any) {
      console.error('Error fetching networks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load networks. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedNetwork || !phoneNumber || !amount) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all fields',
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < 50) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Minimum airtime amount is ₦50',
      });
      return;
    }

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('rgc-services', {
        body: {
          action: 'purchase',
          serviceType: 'airtime',
          network: selectedNetwork.product_id.toString(),
          amount: amountNum,
          mobile_number: phoneNumber,
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success!',
          description: `₦${amountNum.toLocaleString()} airtime sent to ${phoneNumber}`,
        });
        // Reset form
        setPhoneNumber('');
        setAmount('');
        setSelectedNetwork(null);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get unique networks
  const uniqueNetworks = networks.filter((network, index, self) =>
    index === self.findIndex((n) => n.category === network.category)
  );

  return (
    <MobileLayout showNav={false}>
      <div className="safe-area-top">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Buy Airtime</h1>
        </div>

        <div className="px-4 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Network Selection */}
              <div className="mb-6">
                <Label className="mb-3 block">Select Network</Label>
                <div className="grid grid-cols-4 gap-3">
                  {uniqueNetworks.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => setSelectedNetwork(network)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedNetwork?.category === network.category
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${networkColors[network.category] || 'bg-gray-400'} mx-auto mb-2`} />
                      <p className="text-xs font-medium text-center">{network.category}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-6">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08012345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Amount */}
              <div className="mb-4">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Quick Amounts */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        amount === amt.toString()
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-foreground'
                      }`}
                    >
                      {formatPrice(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purchase Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchase}
                disabled={!selectedNetwork || !phoneNumber || !amount || purchasing}
              >
                {purchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Buy Airtime'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
