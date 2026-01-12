import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DataService {
  id: number;
  product_id: number;
  service: string;
  amount: string;
  name: string;
  category: string;
  available: boolean;
}

const networkColors: Record<string, string> = {
  'MTN SME': 'bg-yellow-400',
  'MTN SME II': 'bg-yellow-400',
  'MTN CG': 'bg-yellow-400',
  'MTN DATA SHARE 🎉': 'bg-yellow-400',
  'AIRTEL CG': 'bg-red-500',
  'GLO': 'bg-green-500',
  '9mobile': 'bg-green-700',
};

const getNetworkGroup = (category: string): string => {
  if (category.includes('MTN')) return 'MTN';
  if (category.includes('AIRTEL')) return 'Airtel';
  if (category.includes('GLO')) return 'Glo';
  if (category.includes('9mobile')) return '9mobile';
  return category;
};

export default function Data() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allBundles, setAllBundles] = useState<DataService[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<DataService | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchDataBundles();
  }, []);

  const fetchDataBundles = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('rgc-services', {
        body: { action: 'get-services', serviceType: 'data' }
      });

      if (error) throw error;

      if (data.success && data.data) {
        setAllBundles(data.data.filter((b: DataService) => b.available));
      }
    } catch (error: any) {
      console.error('Error fetching data bundles:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load data bundles. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedNetwork || !selectedBundle || !phoneNumber) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all fields',
      });
      return;
    }

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('rgc-services', {
        body: {
          action: 'purchase',
          serviceType: 'data',
          plan: selectedBundle.id,
          mobile_number: phoneNumber,
          amount: parseFloat(selectedBundle.amount),
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success!',
          description: `${selectedBundle.name} data sent to ${phoneNumber}`,
        });
        // Reset form
        setPhoneNumber('');
        setSelectedBundle(null);
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
    }).format(price);
  };

  // Get unique network groups
  const networkGroups = [...new Set(allBundles.map(b => getNetworkGroup(b.category)))];

  // Get bundles for selected network
  const filteredBundles = selectedNetwork
    ? allBundles.filter(b => getNetworkGroup(b.category) === selectedNetwork)
    : [];

  // Group bundles by category within the network
  const groupedBundles = filteredBundles.reduce((acc, bundle) => {
    if (!acc[bundle.category]) {
      acc[bundle.category] = [];
    }
    acc[bundle.category].push(bundle);
    return acc;
  }, {} as Record<string, DataService[]>);

  return (
    <MobileLayout showNav={false}>
      <div className="safe-area-top">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Buy Data</h1>
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
                  {networkGroups.map((network) => (
                    <button
                      key={network}
                      onClick={() => {
                        setSelectedNetwork(network);
                        setSelectedBundle(null);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedNetwork === network
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${
                        network === 'MTN' ? 'bg-yellow-400' :
                        network === 'Airtel' ? 'bg-red-500' :
                        network === 'Glo' ? 'bg-green-500' :
                        'bg-green-700'
                      } mx-auto mb-2`} />
                      <p className="text-xs font-medium text-center">{network}</p>
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

              {/* Data Bundles */}
              {selectedNetwork && (
                <div className="mb-6">
                  <Label className="mb-3 block">Select Data Bundle</Label>
                  {Object.entries(groupedBundles).map(([category, bundles]) => (
                    <div key={category} className="mb-4">
                      <p className="text-sm font-semibold text-muted-foreground mb-2">{category}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {bundles.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount)).map((bundle) => (
                          <button
                            key={bundle.id}
                            onClick={() => setSelectedBundle(bundle)}
                            className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                              selectedBundle?.id === bundle.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-card'
                            }`}
                          >
                            {selectedBundle?.id === bundle.id && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                            <p className="text-lg font-bold text-foreground">{bundle.name}</p>
                            <p className="text-sm font-semibold text-primary mt-2">
                              {formatPrice(parseFloat(bundle.amount))}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Purchase Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchase}
                disabled={!selectedNetwork || !selectedBundle || !phoneNumber || purchasing}
              >
                {purchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Buy Data'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
