import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Send, Loader2, Trash2, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  target_type: string;
  sent_count: number;
  success_count: number;
  failure_count: number;
  sent_at: string;
}

interface PushSubscription {
  id: string;
  endpoint: string;
  user_id: string | null;
  created_at: string;
}

export default function NotificationsAdmin() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [sendResults, setSendResults] = useState<{ success: number; failed: number } | null>(null);

  // Fetch notification logs and subscriptions
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [logsResult, subsResult] = await Promise.all([
        supabase
          .from('notification_logs' as any)
          .select('*')
          .order('sent_at', { ascending: false })
          .limit(50),
        supabase
          .from('push_subscriptions' as any)
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      if (logsResult.error) {
        console.error('Error fetching logs:', logsResult.error);
      } else {
        setLogs((logsResult.data as unknown as NotificationLog[]) || []);
      }

      if (subsResult.error) {
        console.error('Error fetching subscriptions:', subsResult.error);
      } else {
        setSubscriptions((subsResult.data as unknown as PushSubscription[]) || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Send notification to all subscribers
  const handleSendToAll = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter both title and message');
      return;
    }

    if (subscriptions.length === 0) {
      toast.error('No push subscriptions found');
      return;
    }

    setIsSending(true);
    setSendResults(null);

    let successCount = 0;
    let failureCount = 0;
    const unregisteredTokens: string[] = [];

    try {
      // Get current user for logging
      const { data: { user } } = await supabase.auth.getUser();

      // Send to each subscriber
      for (const sub of subscriptions) {
        try {
          const response = await supabase.functions.invoke('send-push-notification', {
            body: {
              token: sub.endpoint,
              title: title.trim(),
              body: body.trim(),
            },
          });

          // Handle response - both error responses and success
          const data = response.data;
          const error = response.error;

          if (data?.success) {
            successCount++;
          } else {
            failureCount++;
            // Check for UNREGISTERED tokens - these need cleanup
            const errorCode = data?.errorCode || '';
            if (errorCode === 'UNREGISTERED' || errorCode === 'NOT_FOUND') {
              console.log(`Token ${sub.id} is unregistered, marking for deletion`);
              unregisteredTokens.push(sub.id);
            } else if (error) {
              console.error(`Failed to send to ${sub.id}:`, error.message);
            }
          }
        } catch (sendError: any) {
          console.error(`Error sending to ${sub.id}:`, sendError);
          failureCount++;
          // Try to parse error context for UNREGISTERED status
          try {
            const errorData = sendError?.context?.data || sendError?.data;
            if (errorData?.errorCode === 'UNREGISTERED' || errorData?.errorCode === 'NOT_FOUND') {
              unregisteredTokens.push(sub.id);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Delete unregistered tokens
      if (unregisteredTokens.length > 0) {
        console.log(`Deleting ${unregisteredTokens.length} unregistered tokens`);
        const { error: deleteError } = await supabase
          .from('push_subscriptions' as any)
          .delete()
          .in('id', unregisteredTokens);

        if (deleteError) {
          console.error('Failed to delete unregistered tokens:', deleteError);
        } else {
          toast.info(`Removed ${unregisteredTokens.length} invalid subscriptions`);
        }
      }

      // Log the notification
      const { error: logError } = await supabase
        .from('notification_logs' as any)
        .insert({
          title: title.trim(),
          body: body.trim(),
          target_type: 'all',
          sent_count: subscriptions.length,
          success_count: successCount,
          failure_count: failureCount,
          sent_by: user?.id,
        });

      if (logError) {
        console.error('Failed to log notification:', logError);
      }

      setSendResults({ success: successCount, failed: failureCount });

      if (successCount > 0) {
        toast.success(`Sent to ${successCount} devices`);
      }
      if (failureCount > 0) {
        toast.warning(`Failed to send to ${failureCount} devices`);
      }

      // Clear form and refresh data
      setTitle('');
      setBody('');
      fetchData();

    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Failed to send notifications');
    } finally {
      setIsSending(false);
    }
  };

  // Delete a subscription
  const handleDeleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('push_subscriptions' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Subscription deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Failed to delete subscription');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Push Notifications</h1>
          <p className="text-muted-foreground">Send push notifications to app users</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Compose Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Compose Notification
          </CardTitle>
          <CardDescription>
            Send a push notification to all {subscriptions.length} registered devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              placeholder="Notification message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {sendResults && (
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm">
                <span className="text-green-600 font-medium">{sendResults.success} successful</span>
                {' • '}
                <span className="text-red-600 font-medium">{sendResults.failed} failed</span>
              </p>
            </div>
          )}

          <Button
            onClick={handleSendToAll}
            disabled={isSending || !title.trim() || !body.trim() || subscriptions.length === 0}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to All ({subscriptions.length} devices)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Registered Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registered Devices
          </CardTitle>
          <CardDescription>
            {subscriptions.length} device{subscriptions.length !== 1 ? 's' : ''} registered for push notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No devices registered yet. Users need to open the app on their mobile device.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token (truncated)</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs">
                      {sub.endpoint.substring(0, 30)}...
                    </TableCell>
                    <TableCell>
                      {sub.user_id ? (
                        <Badge variant="secondary">Logged in</Badge>
                      ) : (
                        <Badge variant="outline">Anonymous</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(sub.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubscription(sub.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>Recent notifications sent from this dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No notifications sent yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{log.body}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="default" className="bg-green-600">
                          {log.success_count} ✓
                        </Badge>
                        {log.failure_count > 0 && (
                          <Badge variant="destructive">
                            {log.failure_count} ✗
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.sent_at), 'MMM d, HH:mm')}
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
