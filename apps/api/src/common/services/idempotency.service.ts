import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class IdempotencyService {
  private readonly TTL_HOURS = parseInt(process.env.IDEMPOTENCY_TTL_HOURS || '24', 10);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate hash of request body for conflict detection
   */
  private hashRequest(body: any): string {
    const jsonString = JSON.stringify(body, Object.keys(body).sort());
    return createHash('sha256').update(jsonString).digest('hex');
  }

  /**
   * Check idempotency and return stored response if exists
   * @returns Stored response if found, null otherwise
   * @throws ConflictException if same key with different request hash
   */
  async checkIdempotency(
    key: string,
    scope: string,
    requestBody: any,
    organizationId?: string,
  ): Promise<{ status: number; body: any } | null> {
    // Clean up expired records first
    await this.cleanupExpired();

    const requestHash = this.hashRequest(requestBody);

    // Find existing record
    const existing = await this.prisma.idempotencyKey.findUnique({
      where: {
        key_scope: {
          key,
          scope,
        },
      },
    });

    if (!existing) {
      return null; // No existing record, proceed with request
    }

    // Check if expired
    if (existing.expiresAt < new Date()) {
      // Delete expired record
      await this.prisma.idempotencyKey.delete({
        where: {
          key_scope: {
            key,
            scope,
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
        body: JSON.parse(existing.responseJson),
      };
    }

    // Same key+scope but different body hash => conflict
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
    scope: string,
    requestBody: any,
    responseStatus: number,
    responseBody: any,
    organizationId?: string,
  ): Promise<void> {
    const requestHash = this.hashRequest(requestBody);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TTL_HOURS);

    try {
      // Attempt insert inside transaction to handle race conditions
      await this.prisma.$transaction(
        async (tx) => {
          // Try to create the record
          await tx.idempotencyKey.create({
            data: {
              key,
              scope,
              requestHash,
              responseStatus,
              responseJson: JSON.stringify(responseBody),
              status: 'COMPLETED',
              expiresAt,
              organizationId: organizationId || null,
            },
          });
        },
        {
          isolationLevel: 'Serializable', // Highest isolation level for concurrent safety
        },
      );
    } catch (error: any) {
      // Handle unique constraint violation (race condition)
      if (error.code === 'P2002' || error.meta?.target?.includes('key_scope')) {
        // Unique violation: another request already created the record
        // Re-fetch the existing record and apply replay/conflict rules
        const existing = await this.prisma.idempotencyKey.findUnique({
          where: {
            key_scope: {
              key,
              scope,
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
          await this.prisma.idempotencyKey.delete({
            where: {
              key_scope: {
                key,
                scope,
              },
            },
          });
          // Retry once
          return this.storeResponse(key, scope, requestBody, responseStatus, responseBody, organizationId);
        }

        // Check if same request (same hash) - replay scenario
        if (existing.requestHash === requestHash) {
          // Same request, record already stored - this is fine, just return
          return;
        }

        // Same key+scope but different body hash => conflict
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
    const result = await this.prisma.idempotencyKey.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  /**
   * Validate idempotency key format (UUID v4)
   */
  validateIdempotencyKey(key: string | undefined): string {
    if (!key) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    // UUID v4 format validation
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidV4Regex.test(key)) {
      throw new BadRequestException('Idempotency-Key must be a valid UUID v4');
    }

    return key;
  }
}
