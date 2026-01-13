import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, MousePointer, Image as ImageIcon, Loader2 } from 'lucide-react';

interface PromoBanner {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  impressions: number;
  clicks: number;
  created_at: string;
}

export default function PromoBannersPage() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', file: null as File | null });

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from('promo_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to fetch banners');
      return;
    }

    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewBanner({ ...newBanner, file: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!newBanner.title || !newBanner.file) {
      toast.error('Please provide a title and image');
      return;
    }

    setUploading(true);

    try {
      // Upload image to storage
      const fileExt = newBanner.file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('promo-banners')
        .upload(fileName, newBanner.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('promo-banners')
        .getPublicUrl(fileName);

      // Create banner record
      const { error: insertError } = await supabase
        .from('promo_banners')
        .insert({
          title: newBanner.title,
          image_url: urlData.publicUrl,
          display_order: banners.length
        });

      if (insertError) throw insertError;

      toast.success('Banner uploaded successfully');
      setNewBanner({ title: '', file: null });
      setDialogOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('promo_banners')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update banner');
      return;
    }

    setBanners(banners.map(b => 
      b.id === id ? { ...b, is_active: !currentStatus } : b
    ));
    toast.success('Banner updated');
  };

  const deleteBanner = async (id: string, imageUrl: string) => {
    // Extract file name from URL
    const fileName = imageUrl.split('/').pop();
    
    // Delete from storage
    if (fileName) {
      await supabase.storage.from('promo-banners').remove([fileName]);
    }

    // Delete from database
    const { error } = await supabase
      .from('promo_banners')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete banner');
      return;
    }

    setBanners(banners.filter(b => b.id !== id));
    toast.success('Banner deleted');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promo Banners</h1>
          <p className="text-muted-foreground">Manage best reseller promotion banners</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Banner Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Win a Router"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Banner Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {newBanner.file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {newBanner.file.name}
                  </p>
                )}
              </div>
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Banner'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{banners.length}</p>
                <p className="text-sm text-muted-foreground">Total Banners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {banners.reduce((sum, b) => sum + b.impressions, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MousePointer className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {banners.reduce((sum, b) => sum + b.clicks, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No banners uploaded yet</p>
              <p className="text-sm">Click "Add Banner" to upload your first promo banner</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <img 
                        src={banner.image_url} 
                        alt={banner.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell>{banner.impressions.toLocaleString()}</TableCell>
                    <TableCell>{banner.clicks.toLocaleString()}</TableCell>
                    <TableCell>
                      {banner.impressions > 0 
                        ? `${((banner.clicks / banner.impressions) * 100).toFixed(1)}%`
                        : '0%'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={() => toggleActive(banner.id, banner.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBanner(banner.id, banner.image_url)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
