import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FailedJobService {
  private readonly logger = new Logger(FailedJobService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Enregistre un job échoué dans la base de données (DLQ)
   */
  async recordFailedJob(
    queueName: string,
    jobName: string,
    jobData: any,
    errorMessage: string,
    jobId?: string,
  ): Promise<void> {
    try {
      await this.prisma.failedJob.create({
        data: {
          queueName,
          jobName,
          jobData: JSON.stringify(jobData),
          errorMessage,
          jobId: jobId || null,
        },
      });

      this.logger.warn(`Job échoué enregistré dans le DLQ: ${queueName}/${jobName} (ID: ${jobId})`);
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'enregistrement du job échoué:`, error.message);
    }
  }

  /**
   * Récupère les jobs échoués
   */
  async getFailedJobs(queueName?: string, limit = 50) {
    return this.prisma.failedJob.findMany({
      where: queueName ? { queueName } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Supprime un job échoué
   */
  async deleteFailedJob(id: string): Promise<void> {
    await this.prisma.failedJob.delete({
      where: { id },
    });
  }

  /**
   * Réessaie un job échoué (nécessite une implémentation manuelle)
   */
  async retryFailedJob(id: string): Promise<void> {
    const failedJob = await this.prisma.failedJob.findUnique({
      where: { id },
    });

    if (!failedJob) {
      throw new Error(`Job échoué non trouvé: ${id}`);
    }

    this.logger.log(`Réessai du job échoué: ${failedJob.queueName}/${failedJob.jobName} (ID: ${id})`);
    // TODO: Implémenter la logique de réessai selon le type de job
    // Pour l'instant, on supprime simplement le job échoué
    await this.deleteFailedJob(id);
  }
}
