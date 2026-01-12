import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Loader2,
  Save,
  Settings,
  Phone,
  Mail,
  DollarSign,
  Gift,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface AppSettings {
  referral_bonus: { referrer: number; referee: number };
  min_deposit: { amount: number };
  maintenance_mode: { enabled: boolean };
  contact_info: { email: string; phone: string };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: Record<string, any> = {};
      data?.forEach(item => {
        settingsMap[item.key] = item.value;
      });

      setSettings({
        referral_bonus: settingsMap.referral_bonus || { referrer: 200, referee: 100 },
        min_deposit: settingsMap.min_deposit || { amount: 100 },
        maintenance_mode: settingsMap.maintenance_mode || { enabled: false },
        contact_info: settingsMap.contact_info || { email: '', phone: '' }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);

    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('app_settings')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
          <p className="text-gray-500">Configure global app settings</p>
        </div>
        <Button onClick={saveSettings} disabled={saving || !hasChanges}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Bonus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Referral Bonus
            </CardTitle>
            <CardDescription>Configure referral program bonuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Referrer Bonus (₦)</Label>
              <Input
                type="number"
                value={settings.referral_bonus.referrer}
                onChange={(e) => updateSetting('referral_bonus', {
                  ...settings.referral_bonus,
                  referrer: parseInt(e.target.value) || 0
                })}
              />
              <p className="text-xs text-gray-500">Amount given to the person who referred</p>
            </div>
            <div className="space-y-2">
              <Label>Referee Bonus (₦)</Label>
              <Input
                type="number"
                value={settings.referral_bonus.referee}
                onChange={(e) => updateSetting('referral_bonus', {
                  ...settings.referral_bonus,
                  referee: parseInt(e.target.value) || 0
                })}
              />
              <p className="text-xs text-gray-500">Amount given to the new user</p>
            </div>
          </CardContent>
        </Card>

        {/* Minimum Deposit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Minimum Deposit
            </CardTitle>
            <CardDescription>Set minimum funding amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Minimum Amount (₦)</Label>
              <Input
                type="number"
                value={settings.min_deposit.amount}
                onChange={(e) => updateSetting('min_deposit', {
                  amount: parseInt(e.target.value) || 0
                })}
              />
              <p className="text-xs text-gray-500">Users cannot fund less than this amount</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Contact Information
            </CardTitle>
            <CardDescription>App support contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Support Email
              </Label>
              <Input
                type="email"
                value={settings.contact_info.email}
                onChange={(e) => updateSetting('contact_info', {
                  ...settings.contact_info,
                  email: e.target.value
                })}
                placeholder="support@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Support Phone
              </Label>
              <Input
                type="tel"
                value={settings.contact_info.phone}
                onChange={(e) => updateSetting('contact_info', {
                  ...settings.contact_info,
                  phone: e.target.value
                })}
                placeholder="+234800000000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className={settings.maintenance_mode.enabled ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${settings.maintenance_mode.enabled ? 'text-red-500' : ''}`} />
              Maintenance Mode
            </CardTitle>
            <CardDescription>Enable/disable app access for users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-gray-500">
                  {settings.maintenance_mode.enabled 
                    ? 'App is currently in maintenance mode' 
                    : 'App is accessible to all users'}
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode.enabled}
                onCheckedChange={(checked) => updateSetting('maintenance_mode', { enabled: checked })}
              />
            </div>
            {settings.maintenance_mode.enabled && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-sm text-red-800">
                Warning: Users will not be able to access the app while maintenance mode is enabled.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-200 rounded-lg p-4 shadow-lg">
          <p className="text-sm text-yellow-800">You have unsaved changes</p>
        </div>
      )}
    </div>
  );
}
