import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ArrowLeft, BookOpen, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExamType {
  id: number;
  product_id: number;
  service: string;
  amount: string;
  name: string;
  category: string;
  available: boolean;
}

export default function ExamPin() {
  const navigate = useNavigate();
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingExams, setFetchingExams] = useState(true);

  useEffect(() => {
    fetchExamTypes();
  }, []);

  const fetchExamTypes = async () => {
    try {
      setFetchingExams(true);
      const { data, error } = await supabase.functions.invoke('rgc-services', {
        body: { action: 'get-services', serviceType: 'resultcheck' }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setExamTypes(data.data.filter((exam: ExamType) => exam.available));
      }
    } catch (error) {
      console.error('Error fetching exam types:', error);
      toast.error('Failed to load exam types');
    } finally {
      setFetchingExams(false);
    }
  };

  const totalAmount = selectedExam ? Number(selectedExam.amount) * quantity : 0;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam type');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('rgc-services', {
        body: {
          action: 'purchase',
          serviceType: 'resultcheck',
          examid: selectedExam.product_id,
          quantity,
          amount: totalAmount,
          exam_name: selectedExam.name
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`${quantity} ${selectedExam.name} pin(s) purchased successfully!`);
        navigate('/dashboard');
      } else {
        toast.error(data?.message || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout showNav={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Exam Pin</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Exam Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Select Exam Type</label>
            {fetchingExams ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-muted animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : examTypes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No exam pins available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {examTypes.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => {
                      setSelectedExam(exam);
                      setQuantity(1);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedExam?.id === exam.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="font-semibold text-foreground">{exam.name}</p>
                    <p className="text-sm text-primary font-medium">
                      ₦{Number(exam.amount).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity Selection */}
          {selectedExam && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Quantity</label>
              <div className="flex items-center justify-center gap-6 bg-card p-4 rounded-xl">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-12 h-12 rounded-full bg-muted flex items-center justify-center disabled:opacity-50 hover:bg-muted/80 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-3xl font-bold text-foreground w-16 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                  className="w-12 h-12 rounded-full bg-muted flex items-center justify-center disabled:opacity-50 hover:bg-muted/80 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Maximum 10 pins per transaction
              </p>
            </div>
          )}

          {/* Price Summary */}
          {selectedExam && (
            <div className="bg-card rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exam Type</span>
                <span className="font-medium text-foreground">{selectedExam.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per pin</span>
                <span className="font-medium text-foreground">
                  ₦{Number(selectedExam.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium text-foreground">{quantity}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total Amount</span>
                <span className="font-bold text-primary text-lg">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Purchase Button */}
          <Button
            className="w-full h-14 text-lg font-semibold"
            disabled={!selectedExam || loading}
            onClick={handlePurchase}
          >
            {loading ? 'Processing...' : `Buy ${selectedExam?.name || 'Exam'} Pin`}
          </Button>

          {/* Info */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="font-medium text-foreground mb-2">How it works</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Select your exam type (WAEC or NECO)</li>
              <li>• Choose the quantity of pins you need</li>
              <li>• Confirm and complete payment</li>
              <li>• Receive your PIN(s) instantly via notification</li>
            </ul>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
