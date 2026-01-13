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
      <DialogContent className="p-0 border-0 bg-transparent max-w-[90vw] sm:max-w-md shadow-none">
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-background shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
          <img
            src={banner.image_url}
            alt={banner.title}
            onClick={handleClick}
            className="w-full h-auto rounded-xl cursor-pointer shadow-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
