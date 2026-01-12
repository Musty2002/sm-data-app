import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Share2, X } from 'lucide-react';
import { format } from 'date-fns';
import logo from '@/assets/sm-data-logo.jpeg';

// Import network logos
import mtnLogo from '@/assets/networks/mtn-logo.png';
import airtelLogo from '@/assets/networks/airtel-logo.png';
import gloLogo from '@/assets/networks/glo-logo.png';
import nineMobileLogo from '@/assets/networks/9mobile-logo.png';

const networkLogos: Record<string, string> = {
  'MTN': mtnLogo,
  'AIRTEL': airtelLogo,
  'GLO': gloLogo,
  '9MOBILE': nineMobileLogo,
};

interface TransactionReceiptProps {
  open: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    date: Date;
    phoneNumber: string;
    network: string;
    amount: number;
    type: 'airtime' | 'data';
    dataPlan?: string;
  };
}

export function TransactionReceipt({ open, onClose, transaction }: TransactionReceiptProps) {
  const generateTransactionId = () => {
    const dateStr = format(transaction.date, 'yyyyMMdd');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SMA-${dateStr}-${randomStr}`;
  };

  const handleShare = async () => {
    const receiptText = `
SM DATA APP - Transaction Receipt

✅ TRANSACTION SUCCESSFUL

Transaction ID: ${generateTransactionId()}
Date & Time: ${format(transaction.date, 'dd MMM yyyy, hh:mm a')}
Phone Number: ${transaction.phoneNumber}
Network: ${transaction.network}
${transaction.type === 'data' && transaction.dataPlan ? `Data Plan: ${transaction.dataPlan}` : ''}
Amount Paid: ₦${transaction.amount.toLocaleString()}.00

www.smdataapp.com.ng
Customer Support: 09026486913
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Transaction Receipt',
          text: receiptText,
        });
      } catch (error) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(receiptText);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-gray-100 border-0">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-3 top-3 z-10 p-1 rounded-full bg-white/80 hover:bg-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Receipt Card */}
        <div className="bg-white mx-4 my-6 rounded-xl shadow-lg overflow-hidden">
          {/* Header with Logo */}
          <div className="relative pt-6 pb-4 px-6 text-center bg-gradient-to-b from-gray-50 to-white">
            {/* Watermark background text */}
            <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
              <div className="text-[8px] text-gray-500 whitespace-nowrap leading-tight">
                {Array(20).fill('SM DATA APP ').map((text, i) => (
                  <div key={i}>{text.repeat(10)}</div>
                ))}
              </div>
            </div>
            
            <div className="relative flex items-center justify-center gap-3 mb-3">
              <img src={logo} alt="SM Data App" className="w-14 h-14 rounded-full object-cover" />
              <h2 className="text-xl font-bold text-primary">SM DATA APP</h2>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <p className="text-xs text-gray-500 mt-3 tracking-widest">TRANSACTION RECEIPT</p>
          </div>

          {/* Success Banner */}
          <div className="mx-4 mb-4">
            <div className="bg-green-500 text-white py-3 px-4 rounded-lg flex items-center gap-2 justify-center">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">TRANSACTION SUCCESSFUL</span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="px-4 pb-4 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <span className="text-sm text-gray-600">Transaction ID:</span>
              <span className="text-sm font-semibold text-gray-900">{generateTransactionId()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <span className="text-sm text-gray-600">Date & Time:</span>
              <span className="text-sm font-semibold text-gray-900">
                {format(transaction.date, 'dd MMM yyyy, hh:mm a')}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <span className="text-sm text-gray-600">Phone Number:</span>
              <span className="text-sm font-semibold text-gray-900">{transaction.phoneNumber}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <span className="text-sm text-gray-600">Network:</span>
              <div className="flex items-center gap-2">
                {networkLogos[transaction.network] && (
                  <img 
                    src={networkLogos[transaction.network]} 
                    alt={transaction.network} 
                    className="w-5 h-5 object-contain"
                  />
                )}
                <span className="text-sm font-semibold text-red-500">{transaction.network.toLowerCase()}</span>
              </div>
            </div>

            {transaction.type === 'data' && transaction.dataPlan && (
              <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                <span className="text-sm text-gray-600">Data Plan:</span>
                <span className="text-sm font-semibold text-gray-900">{transaction.dataPlan}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Amount Paid:</span>
              <span className="text-lg font-bold text-gray-900">₦{transaction.amount.toLocaleString()}.00</span>
            </div>
          </div>

          {/* Website Link */}
          <div className="text-center py-3">
            <a href="https://www.smdataapp.com.ng" className="text-primary text-sm font-medium hover:underline">
              www.smdataapp.com.ng
            </a>
          </div>

          {/* Support Info */}
          <div className="bg-red-600 py-4 px-4 text-center text-white">
            <p className="text-sm">
              Customer Support: <span className="font-semibold">📞 09026486913</span>
            </p>
            <p className="text-sm mt-1">
              <a href="mailto:support@smdatapp.com" className="underline">support@smdatapp.com</a>
            </p>
          </div>
        </div>

        {/* Share Button */}
        <div className="px-4 pb-6">
          <Button 
            onClick={handleShare}
            variant="outline" 
            className="w-full py-6 text-base font-semibold border-2 border-gray-300 bg-white hover:bg-gray-50"
          >
            <Share2 className="w-5 h-5 mr-2" />
            SHARE RECEIPT
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
