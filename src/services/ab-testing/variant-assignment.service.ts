/**
 * Variant Assignment Service
 *
 * Manages variant assignment for A/B tests, including:
 * - Cookie-based persistence
 * - Visitor bucketing
 * - Assignment retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { assignVariant, TrafficSplit } from './traffic-splitter.service';

const VARIANT_COOKIE_NAME = 'reoptimize_variant';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export interface Variant {
  id: string;
  name: string;
  isControl: boolean;
}

export interface VariantCookie {
  testId: string;
  variantId: string;
  timestamp: number;
}

/**
 * Gets or assigns a variant for a visitor
 */
export function getOrAssignVariant(
  request: NextRequest,
  testId: string,
  trafficSplit: TrafficSplit,
  variants: Variant[],
  visitorId: string
): { variant: Variant; isNew: boolean } {
  // Try to get existing assignment from cookie
  const existingAssignment = getVariantFromCookie(request, testId);

  if (existingAssignment) {
    const variant = variants.find((v) => v.id === existingAssignment.variantId);
    if (variant) {
      return { variant, isNew: false };
    }
  }

  // Assign new variant
  const assignment = assignVariant(visitorId, testId, trafficSplit, variants);

  if (!assignment) {
    // Fallback to control
    const control = variants.find((v) => v.isControl) || variants[0];
    return { variant: control, isNew: true };
  }

  const variant = variants.find((v) => v.id === assignment.variantId);
  if (!variant) {
    const control = variants.find((v) => v.isControl) || variants[0];
    return { variant: control, isNew: true };
  }

  return { variant, isNew: true };
}

/**
 * Gets variant assignment from cookie
 */
export function getVariantFromCookie(
  request: NextRequest,
  testId: string
): VariantCookie | null {
  try {
    const cookieValue = request.cookies.get(VARIANT_COOKIE_NAME)?.value;

    if (!cookieValue) {
      return null;
    }

    const assignments: VariantCookie[] = JSON.parse(decodeURIComponent(cookieValue));
    const assignment = assignments.find((a) => a.testId === testId);

    return assignment || null;
  } catch (error) {
    console.error('Failed to parse variant cookie:', error);
    return null;
  }
}

/**
 * Sets variant assignment in cookie
 */
export function setVariantCookie(
  response: NextResponse,
  testId: string,
  variantId: string
): void {
  try {
    // Get existing assignments
    const existingCookie = response.cookies.get(VARIANT_COOKIE_NAME)?.value;
    let assignments: VariantCookie[] = [];

    if (existingCookie) {
      try {
        assignments = JSON.parse(decodeURIComponent(existingCookie));
      } catch (error) {
        console.error('Failed to parse existing cookie:', error);
      }
    }

    // Remove old assignment for this test
    assignments = assignments.filter((a) => a.testId !== testId);

    // Add new assignment
    assignments.push({
      testId,
      variantId,
      timestamp: Date.now(),
    });

    // Keep only recent assignments (last 10)
    if (assignments.length > 10) {
      assignments = assignments.slice(-10);
    }

    // Set cookie
    response.cookies.set({
      name: VARIANT_COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(assignments)),
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  } catch (error) {
    console.error('Failed to set variant cookie:', error);
  }
}

/**
 * Clears variant assignment for a specific test
 */
export function clearVariantCookie(response: NextResponse, testId: string): void {
  try {
    const existingCookie = response.cookies.get(VARIANT_COOKIE_NAME)?.value;

    if (!existingCookie) {
      return;
    }

    let assignments: VariantCookie[] = JSON.parse(decodeURIComponent(existingCookie));
    assignments = assignments.filter((a) => a.testId !== testId);

    if (assignments.length === 0) {
      response.cookies.delete(VARIANT_COOKIE_NAME);
    } else {
      response.cookies.set({
        name: VARIANT_COOKIE_NAME,
        value: encodeURIComponent(JSON.stringify(assignments)),
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
  } catch (error) {
    console.error('Failed to clear variant cookie:', error);
  }
}

/**
 * Gets all variant assignments from cookie
 */
export function getAllVariantAssignments(request: NextRequest): VariantCookie[] {
  try {
    const cookieValue = request.cookies.get(VARIANT_COOKIE_NAME)?.value;

    if (!cookieValue) {
      return [];
    }

    return JSON.parse(decodeURIComponent(cookieValue));
  } catch (error) {
    console.error('Failed to parse variant cookie:', error);
    return [];
  }
}
