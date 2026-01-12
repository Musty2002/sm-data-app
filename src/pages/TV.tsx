import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CableService {
  id: number;
  product_id: number;
  service: string;
  amount: string;
  name: string;
  category: string;
  available: boolean;
}

const providerColors: Record<string, string> = {
  'DSTV': 'bg-blue-600',
  'GOTV': 'bg-green-600',
  'STARTIMES': 'bg-orange-500',
};

export default function TV() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allPackages, setAllPackages] = useState<CableService[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CableService | null>(null);
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('rgc-services', {
        body: { action: 'get-services', serviceType: 'cable' }
      });

      if (error) throw error;

      if (data.success && data.data) {
        setAllPackages(data.data.filter((p: CableService) => p.available));
      }
    } catch (error: any) {
      console.error('Error fetching packages:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load TV packages. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateSmartCard = async () => {
    if (!smartCardNumber || !selectedProvider) return;

    setValidating(true);
    setCustomerName(null);

    try {
      const { data, error } = await supabase.functions.invoke('rgc-services', {
        body: {
          action: 'validate',
          serviceType: 'cable',
          smart_card_number: smartCardNumber,
          cable_name: selectedProvider,
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
          description: data.message || 'Could not verify smart card number',
        });
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      toast({
        variant: 'destructive',
        title: 'Validation Failed',
        description: error.message || 'Could not verify smart card number',
      });
    } finally {
      setValidating(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProvider || !selectedPackage || !smartCardNumber) {
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
          serviceType: 'cable',
          plan_id: selectedPackage.product_id,
          smart_card_number: smartCardNumber,
          amount: parseFloat(selectedPackage.amount),
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success!',
          description: `${selectedPackage.name} subscription activated`,
        });
        // Reset form
        setSmartCardNumber('');
        setSelectedPackage(null);
        setSelectedProvider(null);
        setCustomerName(null);
      } else {
        throw new Error(data.message || 'Subscription failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        variant: 'destructive',
        title: 'Subscription Failed',
        description: error.message || 'Unable to complete subscription. Please try again.',
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

  // Get unique providers
  const providers = [...new Set(allPackages.map(p => p.category))];

  // Get packages for selected provider
  const filteredPackages = selectedProvider
    ? allPackages.filter(p => p.category === selectedProvider)
    : [];

  return (
    <MobileLayout showNav={false}>
      <div className="safe-area-top">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">TV Subscription</h1>
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
                <Label className="mb-3 block">Select Provider</Label>
                <div className="grid grid-cols-3 gap-3">
                  {providers.map((provider) => (
                    <button
                      key={provider}
                      onClick={() => {
                        setSelectedProvider(provider);
                        setSelectedPackage(null);
                        setCustomerName(null);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedProvider === provider
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full ${providerColors[provider] || 'bg-gray-400'} mx-auto mb-2`} />
                      <p className="text-sm font-medium text-center">{provider}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Card Number */}
              <div className="mb-6">
                <Label htmlFor="smartcard">Smart Card / IUC Number</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="smartcard"
                    placeholder="Enter smart card number"
                    value={smartCardNumber}
                    onChange={(e) => {
                      setSmartCardNumber(e.target.value);
                      setCustomerName(null);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={validateSmartCard}
                    disabled={!smartCardNumber || !selectedProvider || validating}
                  >
                    {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
                {customerName && (
                  <p className="text-sm text-green-600 mt-2">✓ {customerName}</p>
                )}
              </div>

              {/* Package Selection */}
              {selectedProvider && (
                <div className="mb-6">
                  <Label className="mb-3 block">Select Package</Label>
                  <div className="space-y-2">
                    {filteredPackages
                      .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))
                      .map((pkg) => (
                        <button
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                            selectedPackage?.id === pkg.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-medium text-foreground">{pkg.name}</p>
                            <p className="text-sm text-primary font-semibold">{formatPrice(parseFloat(pkg.amount))}</p>
                          </div>
                          {selectedPackage?.id === pkg.id && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Subscribe Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchase}
                disabled={!selectedProvider || !selectedPackage || !smartCardNumber || purchasing}
              >
                {purchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
