// Utility to determine accurate transaction status from metadata
export interface TransactionMetadata {
  error?: string;
  api_response?: {
    status?: string;
    Status?: string;
    message?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export type EffectiveStatus = 'completed' | 'pending' | 'failed';

/**
 * Determines the real transaction status by checking metadata for API response details
 * This handles cases where the database status is "pending" but the API actually succeeded/failed
 */
export function getEffectiveTransactionStatus(
  dbStatus: string,
  metadata?: TransactionMetadata | null
): EffectiveStatus {
  // If there's an error in metadata, it's actually failed
  if (metadata?.error) {
    return 'failed';
  }
  
  // Check API response for actual status
  const apiResponse = metadata?.api_response;
  if (apiResponse) {
    const apiStatus = (apiResponse.status || apiResponse.Status || '').toLowerCase();
    
    // Success indicators
    if (
      apiStatus === 'successful' || 
      apiStatus === 'success' || 
      apiStatus === 'delivered' ||
      apiStatus === 'completed' ||
      apiStatus === 'approved' ||
      apiStatus === 'true' ||
      apiStatus === '1'
    ) {
      return 'completed';
    }
    
    // Failure indicators
    if (
      apiStatus === 'failed' || 
      apiStatus === 'failure' || 
      apiStatus === 'error' ||
      apiStatus === 'rejected' ||
      apiStatus === 'declined' ||
      apiStatus === 'false' ||
      apiStatus === '0'
    ) {
      return 'failed';
    }
    
    // Check for error messages
    if (apiResponse.message?.toLowerCase().includes('error') ||
        apiResponse.message?.toLowerCase().includes('failed') ||
        apiResponse.message?.toLowerCase().includes('insufficient')) {
      return 'failed';
    }
  }
  
  // Fall back to database status
  if (dbStatus === 'completed') return 'completed';
  if (dbStatus === 'failed') return 'failed';
  return 'pending';
}

/**
 * Get CSS classes for status display
 */
export function getStatusColorClasses(status: EffectiveStatus): {
  text: string;
  bg: string;
} {
  switch (status) {
    case 'completed':
      return { text: 'text-green-600', bg: 'bg-green-100' };
    case 'failed':
      return { text: 'text-red-600', bg: 'bg-red-100' };
    case 'pending':
    default:
      return { text: 'text-yellow-600', bg: 'bg-yellow-100' };
  }
}

/**
 * Get display label for status
 */
export function getStatusLabel(status: EffectiveStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'pending':
    default:
      return 'Pending';
  }
}
