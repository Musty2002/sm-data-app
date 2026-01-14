import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  Plus, 
  Loader2,
  Send,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PushNotification {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  status: string;
  created_at: string;
  sent_at: string | null;
}

export default function NotificationsAdmin() {
  const { user } = useAdmin();
  const { sendLocalNotification } = usePushNotifications();
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_audience: 'all'
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };


  const createNotification = async (send: boolean = false) => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      // Create the push notification record as draft first
      const { data: notifData, error: notifError } = await supabase
        .from('push_notifications')
        .insert({
          title: formData.title,
          message: formData.message,
          target_audience: formData.target_audience,
          status: 'draft',
          sent_at: null,
          created_by: user?.id
        })
        .select()
        .single();

      if (notifError) throw notifError;

      // If sending, send as LOCAL notification (this device only)
      if (send && notifData) {
        let localSuccess = false;
        try {
          await sendLocalNotification({ title: formData.title, body: formData.message });
          localSuccess = true;
        } catch (e) {
          console.error('Local notification error:', e);
        }

        const finalStatus = localSuccess ? 'local_sent' : 'failed';
        await supabase
          .from('push_notifications')
          .update({
            status: finalStatus,
            sent_at: localSuccess ? new Date().toISOString() : null,
          })
          .eq('id', notifData.id);

        if (localSuccess) {
          toast.success('Local notification sent on this device');
        } else {
          toast.error('Failed to send local notification');
        }
      } else {
        toast.success('Draft saved');
      }
      setDialogOpen(false);
      setFormData({ title: '', message: '', target_audience: 'all' });
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    } finally {
      setSending(false);
    }
  };

  const sendNotification = async (notif: PushNotification) => {
    setSending(true);
    try {
      let localSuccess = false;
      try {
        await sendLocalNotification({ title: notif.title, body: notif.message });
        localSuccess = true;
      } catch (e) {
        console.error('Local notification error:', e);
      }

      await supabase
        .from('push_notifications')
        .update({
          status: localSuccess ? 'local_sent' : 'failed',
          sent_at: localSuccess ? new Date().toISOString() : null,
        })
        .eq('id', notif.id);

      if (localSuccess) {
        toast.success('Local notification sent on this device');
      } else {
        toast.error('Failed to send local notification');
      }

      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('push_notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'local_sent':
        return <Badge className="bg-green-100 text-green-800">Local Sent</Badge>;
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Local Notifications</h1>
          <p className="text-gray-500">Send a notification on this device (web shows a toast; native shows a local notification)</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Notification
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No notifications yet
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell className="font-medium">{notif.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{notif.message}</TableCell>
                      <TableCell className="capitalize">{notif.target_audience}</TableCell>
                      <TableCell>{getStatusBadge(notif.status)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(notif.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {notif.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => sendNotification(notif)}
                              disabled={sending}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteNotification(notif.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Notification Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
            <DialogDescription>
              Send a notification on this device only
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Notification title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Notification message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Select
                value={formData.target_audience}
                onValueChange={(v) => setFormData({ ...formData, target_audience: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => createNotification(false)} disabled={sending}>
              Save as Draft
            </Button>
            <Button onClick={() => createNotification(true)} disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to this device
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
