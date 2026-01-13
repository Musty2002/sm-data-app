import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PromoBanner {
  id: string;
  title: string;
  image_url: string;
  impressions: number;
  clicks: number;
}

export function PromoPopup() {
  const [open, setOpen] = useState(false);
  const [banner, setBanner] = useState<PromoBanner | null>(null);

  useEffect(() => {
    const fetchRandomBanner = async () => {
      // Check if popup was shown this session
      const shownThisSession = sessionStorage.getItem('promo_popup_shown');
      if (shownThisSession) return;

      const { data, error } = await supabase
        .from('promo_banners')
        .select('id, title, image_url, impressions, clicks')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) return;

      // Pick a random banner
      const randomBanner = data[Math.floor(Math.random() * data.length)];
      setBanner(randomBanner);
      setOpen(true);

      // Mark as shown this session
      sessionStorage.setItem('promo_popup_shown', 'true');

      // Track impression
      await supabase
        .from('promo_banners')
        .update({ impressions: randomBanner.impressions + 1 })
        .eq('id', randomBanner.id);
    };

    // Delay popup slightly for better UX
    const timer = setTimeout(fetchRandomBanner, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = async () => {
    if (banner) {
      // Track click
      await supabase
        .from('promo_banners')
        .update({ clicks: banner.clicks + 1 })
        .eq('id', banner.id);
    }
  };

  if (!banner) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 border-0 bg-transparent w-[80vw] max-w-[320px] shadow-none [&>button]:hidden">
        <div className="relative animate-scale-in">
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-background/95 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-muted transition-all active:scale-95 border border-border"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
          <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <img
              src={banner.image_url}
              alt={banner.title}
              onClick={handleClick}
              className="w-full h-auto max-h-[60vh] object-contain cursor-pointer"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
