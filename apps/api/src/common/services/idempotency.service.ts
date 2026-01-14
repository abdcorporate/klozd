import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class IdempotencyService {
  private readonly TTL_HOURS = 24;

  constructor(private prisma: PrismaService) {}

  /**
   * Generate hash of request body for conflict detection
   */
  private hashRequest(body: any): string {
    const jsonString = JSON.stringify(body);
    return createHash('sha256').update(jsonString).digest('hex');
  }

  /**
   * Check idempotency and return stored response if exists
   * @returns Stored response if found, null otherwise
   */
  async checkIdempotency(
    key: string,
    route: string,
    requestBody: any,
    organizationId?: string,
    ip?: string,
  ): Promise<{ status: number; body: any } | null> {
    // Clean up expired records first
    await this.cleanupExpired();

    const requestHash = this.hashRequest(requestBody);

    // Find existing record
    const existing = await this.prisma.idempotencyRecord.findUnique({
      where: {
        key_route: {
          key,
          route,
        },
      },
    });

    if (!existing) {
      return null; // No existing record, proceed with request
    }

    // Check if expired
    if (existing.expiresAt < new Date()) {
      // Delete expired record
      await this.prisma.idempotencyRecord.delete({
        where: {
          key_route: {
            key,
            route,
          },
        },
      });
      return null;
    }

    // Check if same request (same hash)
    if (existing.requestHash === requestHash) {
      // Return stored response
      return {
        status: existing.responseStatus,
        body: JSON.parse(existing.responseBodyJson),
      };
    }

    // Same key+route but different body hash => conflict
    throw new ConflictException(
      'Idempotency-Key conflict: The same key was used with a different request body.',
    );
  }

  /**
   * Store idempotency record with response
   * Handles race conditions: uses transaction with unique constraint violation handling
   */
  async storeResponse(
    key: string,
    route: string,
    requestBody: any,
    responseStatus: number,
    responseBody: any,
    organizationId?: string,
    ip?: string,
  ): Promise<void> {
    const requestHash = this.hashRequest(requestBody);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TTL_HOURS);

    try {
      // Attempt insert inside transaction to handle race conditions
      await this.prisma.$transaction(
        async (tx) => {
          // Try to create the record
          await tx.idempotencyRecord.create({
            data: {
              key,
              route,
              requestHash,
              responseStatus,
              responseBodyJson: JSON.stringify(responseBody),
              expiresAt,
              organizationId: organizationId || null,
              ip: ip || null,
            },
          });
        },
        {
          isolationLevel: 'Serializable', // Highest isolation level for concurrent safety
        },
      );
    } catch (error: any) {
      // Handle unique constraint violation (race condition)
      if (error.code === 'P2002' || error.meta?.target?.includes('key_route')) {
        // Unique violation: another request already created the record
        // Re-fetch the existing record and apply replay/conflict rules
        const existing = await this.prisma.idempotencyRecord.findUnique({
          where: {
            key_route: {
              key,
              route,
            },
          },
        });

        if (!existing) {
          // Should not happen, but handle gracefully
          throw new Error('Idempotency record conflict: record not found after unique violation');
        }

        // Check if expired
        if (existing.expiresAt < new Date()) {
          // Record expired, delete and retry (but this shouldn't happen in practice)
          await this.prisma.idempotencyRecord.delete({
            where: {
              key_route: {
                key,
                route,
              },
            },
          });
          // Retry once
          return this.storeResponse(key, route, requestBody, responseStatus, responseBody, organizationId, ip);
        }

        // Check if same request (same hash) - replay scenario
        if (existing.requestHash === requestHash) {
          // Same request, record already stored - this is fine, just return
          return;
        }

        // Same key+route but different body hash => conflict
        throw new ConflictException(
          'Idempotency-Key conflict: The same key was used with a different request body.',
        );
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Clean up expired idempotency records
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.prisma.idempotencyRecord.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }
}
