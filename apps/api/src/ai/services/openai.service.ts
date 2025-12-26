import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OPENAI_API_KEY not configured. AI features will be limited.');
    }
  }

  /**
   * Analyse le sentiment d'un texte (positif, neutre, négatif)
   */
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    reasoning?: string;
  }> {
    if (!this.openai) {
      // Fallback si OpenAI n'est pas configuré
      return { sentiment: 'neutral', score: 0.5 };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse de sentiment. Analyse le texte et réponds uniquement avec un JSON: {"sentiment": "positive"|"neutral"|"negative", "score": 0.0-1.0, "reasoning": "explication courte"}',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return {
          sentiment: parsed.sentiment,
          score: parsed.score,
          reasoning: parsed.reasoning,
        };
      }
    } catch (error) {
      this.logger.error('Error analyzing sentiment:', error);
    }

    return { sentiment: 'neutral', score: 0.5 };
  }

  /**
   * Prédit la probabilité de closing avec OpenAI
   */
  async predictClosingProbability(leadData: {
    qualificationScore?: number;
    budget?: number;
    urgency?: string;
    sector?: string;
    email?: string;
    notes?: string;
  }): Promise<{
    probability: number;
    confidence: number;
    factors: string[];
    reasoning?: string;
  }> {
    if (!this.openai) {
      // Fallback si OpenAI n'est pas configuré
      return {
        probability: 50,
        confidence: 50,
        factors: ['OpenAI non configuré'],
      };
    }

    try {
      const prompt = `Analyse ce lead et prédit sa probabilité de closing (0-100%):

Score de qualification: ${leadData.qualificationScore || 'N/A'}
Budget: ${leadData.budget ? `€${leadData.budget}` : 'Non spécifié'}
Urgence: ${leadData.urgency || 'Non spécifiée'}
Secteur: ${leadData.sector || 'Non spécifié'}
Email: ${leadData.email || 'N/A'}
Notes: ${leadData.notes || 'Aucune'}

Réponds avec un JSON: {"probability": 0-100, "confidence": 0-100, "factors": ["facteur1", "facteur2"], "reasoning": "explication"}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en vente et prédiction de conversion. Analyse les données du lead et prédit sa probabilité de closing.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return {
          probability: parsed.probability || 50,
          confidence: parsed.confidence || 50,
          factors: parsed.factors || [],
          reasoning: parsed.reasoning,
        };
      }
    } catch (error) {
      this.logger.error('Error predicting closing probability:', error);
    }

    return {
      probability: 50,
      confidence: 50,
      factors: ['Erreur lors de la prédiction'],
    };
  }

  /**
   * Génère des suggestions de messages personnalisés
   */
  async generateMessageSuggestions(context: {
    leadName: string;
    leadEmail: string;
    stage: string;
    previousMessages?: string[];
    leadNotes?: string;
  }): Promise<string[]> {
    if (!this.openai) {
      return [
        'Bonjour, je vous contacte concernant votre demande.',
        'Merci pour votre intérêt. Souhaitez-vous planifier un appel ?',
      ];
    }

    try {
      const prompt = `Génère 3 suggestions de messages personnalisés pour ce lead:

Nom: ${context.leadName}
Email: ${context.leadEmail}
Étape: ${context.stage}
Notes: ${context.leadNotes || 'Aucune'}
Messages précédents: ${context.previousMessages?.join('\n') || 'Aucun'}

Génère 3 messages courts, professionnels et personnalisés. Réponds avec un JSON: {"messages": ["message1", "message2", "message3"]}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en communication commerciale. Génère des messages courts, professionnels et personnalisés.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return parsed.messages || [];
      }
    } catch (error) {
      this.logger.error('Error generating message suggestions:', error);
    }

    return [
      'Bonjour, je vous contacte concernant votre demande.',
      'Merci pour votre intérêt. Souhaitez-vous planifier un appel ?',
    ];
  }
}




