/**
 * API Routes for Individual Link Operations
 * GET /api/links/:code - Get stats for a specific link
 * DELETE /api/links/:code - Delete a link
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/links/:code
 * Retrieves statistics for a specific short link
 * Returns: 200 with link data, 404 if not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Find link by code
    const link = await prisma.link.findUnique({
      where: { code },
    });

    // Return 404 if link not found
    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Return link data
    return NextResponse.json(link);
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/links/:code
 * Deletes a shortened link
 * Returns: 200 on success, 404 if not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Check if link exists
    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Delete the link
    await prisma.link.delete({
      where: { code },
    });

    // Return success
    return NextResponse.json(
      { message: 'Link deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
