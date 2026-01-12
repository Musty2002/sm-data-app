import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TransactionReceipt } from '@/components/TransactionReceipt';

// Import network logos
import mtnLogo from '@/assets/networks/mtn-logo.png';
import airtelLogo from '@/assets/networks/airtel-logo.png';
import gloLogo from '@/assets/networks/glo-logo.png';
import nineMobileLogo from '@/assets/networks/9mobile-logo.png';

interface AirtimeService {
  id: number;
  product_id: number;
  service: string;
  name: string | null;
  category: string;
  available: boolean;
}

const networkLogos: Record<string, string> = {
  'MTN': mtnLogo,
  'AIRTEL': airtelLogo,
  'GLO': gloLogo,
  '9MOBILE': nineMobileLogo,
};

const networkColors: Record<string, string> = {
  'MTN': 'bg-yellow-400/10 border-yellow-400',
  'AIRTEL': 'bg-red-500/10 border-red-500',
  'GLO': 'bg-green-500/10 border-green-500',
  '9MOBILE': 'bg-emerald-600/10 border-emerald-600',
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
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{
    id: string;
    date: Date;
    phoneNumber: string;
    network: string;
    amount: number;
    type: 'airtime' | 'data';
  } | null>(null);

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
          network: selectedNetwork.id.toString(),
          amount: amountNum,
          mobile_number: phoneNumber,
        }
      });

      if (error) throw error;

      if (data.success) {
        // Set transaction data and show receipt
        setLastTransaction({
          id: data.data?.reference || `TXN-${Date.now()}`,
          date: new Date(),
          phoneNumber,
          network: selectedNetwork.category,
          amount: amountNum,
          type: 'airtime',
        });
        setShowReceipt(true);
        
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
                <div className="grid grid-cols-2 gap-4">
                  {uniqueNetworks.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => setSelectedNetwork(network)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 hover:scale-[1.02] active:scale-[0.98] ${
                        selectedNetwork?.category === network.category
                          ? 'border-primary bg-primary/5'
                          : networkColors[network.category] || 'border-border bg-card'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm overflow-hidden">
                        {networkLogos[network.category] ? (
                          <img 
                            src={networkLogos[network.category]} 
                            alt={network.category} 
                            className="w-10 h-10 object-contain rounded-lg"
                          />
                        ) : (
                          <span className="text-lg font-bold">{network.category.charAt(0)}</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground">{network.category}</p>
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

      {/* Transaction Receipt Modal */}
      {lastTransaction && (
        <TransactionReceipt
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          transaction={lastTransaction}
        />
      )}
    </MobileLayout>
  );
}
