/**
 * Standardized API Response Utility
 * Ensures consistent response format across all endpoints
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  /**
   * Success response with data
   */
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      data,
      ...(message && { message }),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Error response
   */
  static error(message: string, code?: string, details?: any) {
    return {
      success: false,
      error: {
        message,
        ...(code && { code }),
        ...(details && { details })
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Paginated response
   */
  static paginated<T>(items: T[], pagination: PaginationMeta) {
    return {
      success: true,
      data: items,
      pagination,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Created response (201)
   */
  static created<T>(data: T, message = 'Resource created successfully') {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * No content response (204)
   */
  static noContent() {
    return {
      success: true,
      message: 'Operation completed successfully',
      timestamp: new Date().toISOString()
    };
  }
}

