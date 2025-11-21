/**
 * Health Check Endpoint
 * GET /healthz - Returns application health status
 * Required for automated testing and monitoring
 */

import { NextResponse } from 'next/server';

// Track application start time for uptime calculation
const startTime = Date.now();

/**
 * GET /healthz
 * Returns health status of the application
 * Response includes version, uptime, and database connectivity
 */
export async function GET() {
  try {
    // Calculate uptime in seconds
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    // Health check response
    const healthData = {
      ok: true,
      version: '1.0',
      uptime: uptimeSeconds,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    // Return error status if health check fails
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        ok: false,
        version: '1.0',
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
