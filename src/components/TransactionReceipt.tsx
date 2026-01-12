import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Share2, X, Phone, Mail, Download } from 'lucide-react';
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

const networkColors: Record<string, string> = {
  'MTN': 'text-yellow-500',
  'AIRTEL': 'text-red-500',
  'GLO': 'text-green-500',
  '9MOBILE': 'text-green-600',
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

  const transactionId = generateTransactionId();

  const handleShare = async () => {
    const receiptText = `
━━━━━━━━━━━━━━━━━━━━━━
    SM DATA APP
   TRANSACTION RECEIPT
━━━━━━━━━━━━━━━━━━━━━━

✅ TRANSACTION SUCCESSFUL

📋 Transaction ID:
${transactionId}

📅 Date & Time:
${format(transaction.date, 'dd MMM yyyy, hh:mm a')}

📱 Phone Number:
${transaction.phoneNumber}

📶 Network: ${transaction.network}
${transaction.type === 'data' && transaction.dataPlan ? `📦 Data Plan: ${transaction.dataPlan}` : `📞 Service: Airtime`}

💰 Amount Paid: ₦${transaction.amount.toLocaleString()}.00

━━━━━━━━━━━━━━━━━━━━━━
🌐 www.smdataapp.com.ng
📞 Support: 09026486913
📧 support@smdatapp.com
━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SM Data App - Transaction Receipt',
          text: receiptText,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(receiptText);
    }
  };

  const networkKey = transaction.network.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[360px] p-0 overflow-hidden bg-transparent border-0 shadow-none">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-2 top-2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Receipt Card with paper effect */}
        <div className="relative">
          {/* Top zigzag edge */}
          <div className="h-4 bg-white" style={{
            clipPath: 'polygon(0% 100%, 2.5% 50%, 5% 100%, 7.5% 50%, 10% 100%, 12.5% 50%, 15% 100%, 17.5% 50%, 20% 100%, 22.5% 50%, 25% 100%, 27.5% 50%, 30% 100%, 32.5% 50%, 35% 100%, 37.5% 50%, 40% 100%, 42.5% 50%, 45% 100%, 47.5% 50%, 50% 100%, 52.5% 50%, 55% 100%, 57.5% 50%, 60% 100%, 62.5% 50%, 65% 100%, 67.5% 50%, 70% 100%, 72.5% 50%, 75% 100%, 77.5% 50%, 80% 100%, 82.5% 50%, 85% 100%, 87.5% 50%, 90% 100%, 92.5% 50%, 95% 100%, 97.5% 50%, 100% 100%)'
          }} />
          
          <div className="bg-white shadow-2xl">
            {/* Header with Logo and Watermark */}
            <div className="relative pt-6 pb-5 px-6 text-center overflow-hidden">
              {/* Watermark background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl font-black text-gray-900 rotate-[-15deg] whitespace-nowrap">
                    SM DATA APP
                  </div>
                </div>
              </div>
              
              {/* Logo and Brand */}
              <div className="relative flex flex-col items-center gap-2 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-lg">
                  <img src={logo} alt="SM Data App" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary tracking-tight">SM DATA APP</h2>
                  <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase mt-1">
                    Transaction Receipt
                  </p>
                </div>
              </div>

              {/* Decorative line */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="w-2 h-2 rounded-full bg-primary/30" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            </div>

            {/* Success Banner */}
            <div className="mx-5 mb-5">
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-5 rounded-2xl shadow-lg shadow-green-500/25 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50" />
                <div className="relative flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-base tracking-wide">SUCCESSFUL</span>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="px-5 pb-5">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-0">
                {/* Transaction ID */}
                <div className="flex justify-between items-start py-3 border-b border-dashed border-gray-200">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Trans. ID</span>
                  <span className="text-xs font-mono font-bold text-gray-800 text-right max-w-[160px] break-all">
                    {transactionId}
                  </span>
                </div>
                
                {/* Date & Time */}
                <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Date & Time</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {format(transaction.date, 'dd MMM yyyy, hh:mm a')}
                  </span>
                </div>
                
                {/* Phone Number */}
                <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Phone</span>
                  <span className="text-sm font-bold text-gray-800 font-mono">{transaction.phoneNumber}</span>
                </div>
                
                {/* Network */}
                <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Network</span>
                  <div className="flex items-center gap-2">
                    {networkLogos[networkKey] && (
                      <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden">
                        <img 
                          src={networkLogos[networkKey]} 
                          alt={transaction.network} 
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                    )}
                    <span className={`text-sm font-bold capitalize ${networkColors[networkKey] || 'text-gray-800'}`}>
                      {transaction.network.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Data Plan (if applicable) */}
                {transaction.type === 'data' && transaction.dataPlan && (
                  <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Data Plan</span>
                    <span className="text-sm font-semibold text-gray-800 text-right max-w-[150px]">
                      {transaction.dataPlan}
                    </span>
                  </div>
                )}

                {/* Service Type */}
                <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Service</span>
                  <span className="text-sm font-semibold text-gray-800 capitalize">{transaction.type}</span>
                </div>
                
                {/* Amount - Highlighted */}
                <div className="flex justify-between items-center pt-4">
                  <span className="text-sm text-gray-600 font-medium">Amount Paid</span>
                  <span className="text-2xl font-black text-primary">
                    ₦{transaction.amount.toLocaleString()}<span className="text-base">.00</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Website Link */}
            <div className="text-center pb-4">
              <a 
                href="https://www.smdataapp.com.ng" 
                className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
              >
                www.smdataapp.com.ng
              </a>
            </div>

            {/* Support Info */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 py-4 px-5">
              <p className="text-center text-white/80 text-xs uppercase tracking-wider mb-2">Customer Support</p>
              <div className="flex items-center justify-center gap-6">
                <a href="tel:09026486913" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-bold">09026486913</span>
                </a>
                <a href="mailto:support@smdatapp.com" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-bold">Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom zigzag edge */}
          <div className="h-4 bg-white" style={{
            clipPath: 'polygon(0% 0%, 2.5% 50%, 5% 0%, 7.5% 50%, 10% 0%, 12.5% 50%, 15% 0%, 17.5% 50%, 20% 0%, 22.5% 50%, 25% 0%, 27.5% 50%, 30% 0%, 32.5% 50%, 35% 0%, 37.5% 50%, 40% 0%, 42.5% 50%, 45% 0%, 47.5% 50%, 50% 0%, 52.5% 50%, 55% 0%, 57.5% 50%, 60% 0%, 62.5% 50%, 65% 0%, 67.5% 50%, 70% 0%, 72.5% 50%, 75% 0%, 77.5% 50%, 80% 0%, 82.5% 50%, 85% 0%, 87.5% 50%, 90% 0%, 92.5% 50%, 95% 0%, 97.5% 50%, 100% 0%)'
          }} />
        </div>

        {/* Share Button */}
        <div className="mt-4">
          <Button 
            onClick={handleShare}
            className="w-full py-6 text-base font-bold bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 shadow-lg"
          >
            <Share2 className="w-5 h-5 mr-2" />
            SHARE RECEIPT
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
