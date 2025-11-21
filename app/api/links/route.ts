/**
 * API Routes for Links Management
 * POST /api/links - Create a new short link
 * GET /api/links - Get all links
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidUrl, isValidCode, generateRandomCode } from '@/lib/utils';

/**
 * POST /api/links
 * Creates a new shortened link
 * Request body: { targetUrl: string, code?: string }
 * Returns: 201 with link data, 400 for validation errors, 409 if code exists
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { targetUrl, code } = body;

    // Validate target URL is provided
    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Target URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!isValidUrl(targetUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format. Must be a valid HTTP or HTTPS URL' },
        { status: 400 }
      );
    }

    // Generate or validate custom code
    let shortCode = code;

    if (shortCode) {
      // Validate custom code format
      if (!isValidCode(shortCode)) {
        return NextResponse.json(
          { error: 'Invalid code format. Must be 6-8 alphanumeric characters' },
          { status: 400 }
        );
      }

      // Check if code already exists
      const existing = await prisma.link.findUnique({
        where: { code: shortCode },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'This short code is already taken. Please choose another' },
          { status: 409 }
        );
      }
    } else {
      // Generate random code and ensure uniqueness
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        shortCode = generateRandomCode(6);
        const existing = await prisma.link.findUnique({
          where: { code: shortCode },
        });

        if (!existing) break;
        attempts++;
      }

      if (attempts === maxAttempts) {
        return NextResponse.json(
          { error: 'Failed to generate unique code. Please try again' },
          { status: 500 }
        );
      }
    }

    // Create the link in database
    const link = await prisma.link.create({
      data: {
        code: shortCode,
        targetUrl,
      },
    });

    // Return created link
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/links
 * Retrieves all links with their statistics
 * Returns: 200 with array of links
 */
export async function GET() {
  try {
    // Fetch all links, ordered by creation date (newest first)
    const links = await prisma.link.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
