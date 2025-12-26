import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Lead } from '@prisma/client';
import { OpenAIService } from './services/openai.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenAIService,
    private configService: ConfigService,
  ) {}

  /**
   * Prédit la probabilité de closing d'un lead
   * Utilise OpenAI si disponible, sinon fallback sur modèle simple
   */
  async predictClosingProbability(lead: Lead): Promise<number> {
    const useOpenAI = this.configService.get<string>('OPENAI_API_KEY');

    if (useOpenAI) {
      // Utiliser OpenAI pour une prédiction plus précise
      const submissions = await this.prisma.formSubmission.findMany({
        where: { leadId: lead.id },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      // Notes supprimées (module Activities retiré)
      // Utiliser les notes du lead directement si disponibles
      const leadNotes = lead.notes || '';

      const prediction = await this.openaiService.predictClosingProbability({
        qualificationScore: lead.qualificationScore || undefined,
        budget: lead.budget || undefined,
        urgency: lead.urgency || undefined,
        sector: lead.sector || undefined,
        email: lead.email,
        notes: leadNotes,
      });

      return prediction.probability;
    }

    // Fallback sur modèle simple
    let probability = 50; // Base de 50%

    // Facteur 1: Score de qualification
    if (lead.qualificationScore) {
      probability += (lead.qualificationScore - 70) * 0.3; // +0.3% par point au-dessus de 70
    }

    // Facteur 2: Budget déclaré
    if (lead.budget) {
      if (lead.budget >= 10000) {
        probability += 15;
      } else if (lead.budget >= 5000) {
        probability += 10;
      } else if (lead.budget >= 2000) {
        probability += 5;
      }
    }

    // Facteur 3: Urgence
    if (lead.urgency === 'high') {
      probability += 10;
    } else if (lead.urgency === 'medium') {
      probability += 5;
    }

    // Facteur 4: Historique (si le lead a déjà eu des appels)
    const appointmentCount = await this.prisma.appointment.count({
      where: {
        leadId: lead.id,
        status: 'COMPLETED',
      },
    });

    if (appointmentCount > 0) {
      probability += 10; // A déjà eu un appel = plus engagé
    }

    // Normaliser entre 0 et 100
    probability = Math.max(0, Math.min(100, Math.round(probability)));

    return probability;
  }

  /**
   * Prédit la valeur probable d'un deal
   */
  async predictDealValue(lead: Lead): Promise<number | null> {
    // Si le budget est déclaré, l'utiliser comme base
    if (lead.budget) {
      return lead.budget;
    }

    // Sinon, estimer basé sur le secteur et le score
    // TODO: Utiliser des données historiques pour améliorer
    const baseValue = 5000;

    if (lead.qualificationScore) {
      return baseValue + (lead.qualificationScore - 70) * 100;
    }

    return baseValue;
  }

  /**
   * Génère une prédiction complète pour un lead
   */
  async generatePrediction(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead non trouvé');
    }

    const closingProbability = await this.predictClosingProbability(lead);
    const predictedValue = await this.predictDealValue(lead);

    // Calculer la confiance (basée sur la quantité de données disponibles)
    let confidence = 50;
    if (lead.qualificationScore) confidence += 20;
    if (lead.budget) confidence += 15;
    if (lead.urgency) confidence += 10;
    if (lead.sector) confidence += 5;
    confidence = Math.min(100, confidence);

    // Créer ou mettre à jour la prédiction
    const prediction = await this.prisma.aIPrediction.upsert({
      where: { leadId },
      create: {
        leadId,
        closingProbability,
        predictedValue,
        confidence,
        factorsJson: JSON.stringify({
          qualificationScore: lead.qualificationScore,
          budget: lead.budget,
          urgency: lead.urgency,
          sector: lead.sector,
        }),
      },
      update: {
        closingProbability,
        predictedValue,
        confidence,
        factorsJson: JSON.stringify({
          qualificationScore: lead.qualificationScore,
          budget: lead.budget,
          urgency: lead.urgency,
          sector: lead.sector,
        }),
        updatedAt: new Date(),
      },
    });

    // Mettre à jour le lead avec les prédictions
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        closingProbability,
        predictedValue,
      },
    });

    return prediction;
  }

  /**
   * Analyse le sentiment d'un texte (notes, emails, etc.)
   */
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    reasoning?: string;
  }> {
    return this.openaiService.analyzeSentiment(text);
  }

  /**
   * Génère des suggestions de messages personnalisés pour un lead
   */
  async generateMessageSuggestions(leadId: string): Promise<string[]> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead non trouvé');
    }

    // Module Activities supprimé - utiliser les notes du lead et les submissions
    const previousMessages: string[] = [];
    if (lead.notes) {
      previousMessages.push(lead.notes);
    }

    return this.openaiService.generateMessageSuggestions({
      leadName: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.email,
      leadEmail: lead.email,
      stage: lead.status,
      previousMessages,
      leadNotes: lead.notes || undefined,
    });
  }
}


