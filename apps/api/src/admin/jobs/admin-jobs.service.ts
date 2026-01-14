import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FailedJobService } from '../../queue/failed-job.service';
import {
  PaginationQueryDto,
  buildOrderBy,
  buildCursorWhere,
  extractCursor,
  PaginatedResponse,
} from '../../common/pagination';

@Injectable()
export class AdminJobsService {
  private readonly logger = new Logger(AdminJobsService.name);

  constructor(
    private prisma: PrismaService,
    private failedJobService: FailedJobService,
  ) {}

  /**
   * Récupère les jobs échoués avec pagination par curseur
   */
  async getFailedJobs(
    userRole: string,
    pagination: PaginationQueryDto,
    queueName?: string,
  ): Promise<PaginatedResponse<any>> {
    // Vérifier que l'utilisateur est ADMIN ou SUPER_ADMIN
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Seuls les administrateurs peuvent consulter les jobs échoués');
    }

    const {
      limit = 50,
      cursor,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      q,
    } = pagination;

    // Construire la clause where
    let where: any = {};

    // Filtre par queueName
    if (queueName) {
      where.queueName = queueName;
    }

    // Recherche textuelle (q) dans jobName et errorMessage
    if (q) {
      where.OR = [
        { jobName: { contains: q, mode: 'insensitive' } },
        { errorMessage: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Cursor pagination
    const cursorWhere = buildCursorWhere(cursor, sortBy, sortOrder);
    if (cursorWhere) {
      where = {
        AND: [
          where,
          cursorWhere,
        ],
      };
    }

    // Ordering (par défaut: createdAt desc avec id comme tie-breaker)
    const orderBy = buildOrderBy(sortBy, sortOrder, { createdAt: 'desc', id: 'desc' });

    // Fetch one extra item to determine if there's a next page
    const take = limit + 1;
    const data = await this.prisma.failedJob.findMany({
      where,
      take,
      orderBy,
    });

    // Check if there's a next page
    const hasNextPage = data.length > limit;
    const items = hasNextPage ? data.slice(0, limit) : data;

    // Extract cursor from last item
    const nextCursor = items.length > 0
      ? extractCursor(items[items.length - 1], sortBy)
      : null;

    return new PaginatedResponse(items, limit, nextCursor);
  }

  /**
   * Supprime un job échoué
   */
  async deleteFailedJob(userRole: string, id: string): Promise<void> {
    // Vérifier que l'utilisateur est ADMIN ou SUPER_ADMIN
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Seuls les administrateurs peuvent supprimer les jobs échoués');
    }

    await this.failedJobService.deleteFailedJob(id);
    this.logger.log(`Job échoué ${id} supprimé par l'utilisateur avec le rôle ${userRole}`);
  }
}
