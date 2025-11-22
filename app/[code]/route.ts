/**
 * Dynamic Route for URL Redirection
 * GET /:code - Redirects to the original URL and tracks clicks
 * This handles the short link redirection with analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering - this route cannot be statically generated
export const dynamic = 'force-dynamic';

/**
 * GET /:code
 * Redirects to the target URL after incrementing click count
 * Returns: 302 redirect to target URL, 404 if code not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Find the link by code
    const link = await prisma.link.findUnique({
      where: { code },
    });

    // Return 404 if link doesn't exist
    if (!link) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Not Found - TinyLink</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 48px 32px;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 32px;
      color: #1f2937;
      margin-bottom: 12px;
    }
    p {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .code {
      background: #f3f4f6;
      padding: 8px 16px;
      border-radius: 8px;
      font-family: monospace;
      font-weight: 600;
      color: #ef4444;
      display: inline-block;
      margin-bottom: 24px;
    }
    a {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    a:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔍</div>
    <h1>Link Not Found</h1>
    <p>The short link you're looking for doesn't exist or has been deleted.</p>
    <div class="code">${code}</div>
    <a href="/">Go to Dashboard</a>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      );
    }

    // Update click count and last clicked timestamp
    // Using update instead of separate read-modify-write to avoid race conditions
    await prisma.link.update({
      where: { code },
      data: {
        clicks: {
          increment: 1, // Atomically increment click count
        },
        lastClicked: new Date(), // Update last clicked time
      },
    });

    // Perform 302 redirect to the original URL
    return NextResponse.redirect(link.targetUrl, { status: 302 });
  } catch (error) {
    console.error('Error processing redirect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
