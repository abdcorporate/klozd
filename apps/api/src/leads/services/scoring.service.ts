import { Injectable } from '@nestjs/common';
import { Form, FormField } from '@prisma/client';

interface ScoringRule {
  condition?: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value?: string | number;
  min?: number;
  max?: number;
  values?: string[];
  score: number;
  weight?: number;
}

@Injectable()
export class ScoringService {
  /**
   * Calcule le score de qualification d'une soumission de formulaire
   * Prend en compte la pondération des champs et des règles
   */
  calculateScore(
    form: Form & { formFields: FormField[] },
    submissionData: Record<string, any>,
  ): number {
    let totalScore = 0;
    let maxScore = 0;

    for (const field of form.formFields) {
      const fieldValue = submissionData[field.label] || submissionData[field.id];
      
      if (!fieldValue && field.required) {
        // Champ requis non rempli = 0 points
        continue;
      }

      const fieldScore = this.calculateFieldScore(field, fieldValue);
      const fieldWeight = this.getFieldWeight(field);
      
      // Appliquer la pondération du champ
      totalScore += fieldScore.score * fieldWeight;
      maxScore += fieldScore.max * fieldWeight;
    }

    // Score final en pourcentage (0-100)
    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  }

  /**
   * Récupère la pondération d'un champ (par défaut 1)
   */
  private getFieldWeight(field: FormField): number {
    // La pondération peut être stockée dans un champ séparé ou dans les métadonnées
    // Pour l'instant, on utilise une valeur par défaut de 1
    // TODO: Ajouter un champ weight dans le schéma Prisma si nécessaire
    return 1;
  }

  /**
   * Calcule le score pour un champ spécifique
   * Prend en compte les règles de scoring avancées avec pondération
   */
  private calculateFieldScore(
    field: FormField,
    value: any,
  ): { score: number; max: number } {
    if (!field.scoringRulesJson) {
      // Pas de règles de scoring = 10 points par défaut si rempli
      return { score: value ? 10 : 0, max: 10 };
    }

    try {
      const rules: ScoringRule[] = JSON.parse(field.scoringRulesJson);
      let maxScore = 0;
      let matchedScore = 0;

      for (const rule of rules) {
        const ruleWeight = rule.weight || 1;
        const weightedScore = rule.score * ruleWeight;
        maxScore = Math.max(maxScore, weightedScore);

        if (this.matchesRule(rule, value)) {
          matchedScore = Math.max(matchedScore, weightedScore);
        }
      }

      return { score: matchedScore, max: maxScore || 10 };
    } catch (error) {
      // En cas d'erreur de parsing, score par défaut
      return { score: value ? 10 : 0, max: 10 };
    }
  }

  /**
   * Vérifie si une valeur correspond à une règle de scoring
   * Supporte les conditions avancées : equals, contains, greater_than, less_than, between, in
   */
  private matchesRule(rule: ScoringRule, value: any): boolean {
    const condition = rule.condition || 'equals';

    switch (condition) {
      case 'equals':
        if (rule.value !== undefined) {
          return String(value).toLowerCase() === String(rule.value).toLowerCase();
        }
        return false;

      case 'contains':
        if (rule.value !== undefined) {
          return String(value).toLowerCase().includes(String(rule.value).toLowerCase());
        }
        return false;

      case 'greater_than':
        if (rule.value !== undefined) {
          const numValue = Number(value);
          const ruleValue = Number(rule.value);
          return !isNaN(numValue) && !isNaN(ruleValue) && numValue > ruleValue;
        }
        return false;

      case 'less_than':
        if (rule.value !== undefined) {
          const numValue = Number(value);
          const ruleValue = Number(rule.value);
          return !isNaN(numValue) && !isNaN(ruleValue) && numValue < ruleValue;
        }
        return false;

      case 'between':
        if (rule.min !== undefined || rule.max !== undefined) {
          const numValue = Number(value);
          if (isNaN(numValue)) return false;

          const min = rule.min ?? -Infinity;
          const max = rule.max ?? Infinity;
          return numValue >= min && numValue <= max;
        }
        return false;

      case 'in':
        if (rule.values && rule.values.length > 0) {
          const valueStr = String(value).toLowerCase();
          return rule.values.some((v) => String(v).toLowerCase() === valueStr);
        }
        return false;

      default:
        // Fallback pour compatibilité avec l'ancien format
        if (rule.value !== undefined) {
          return String(value).toLowerCase() === String(rule.value).toLowerCase();
        }
        if (rule.min !== undefined || rule.max !== undefined) {
          const numValue = Number(value);
          if (isNaN(numValue)) return false;
          const min = rule.min ?? -Infinity;
          const max = rule.max ?? Infinity;
          return numValue >= min && numValue <= max;
        }
        return false;
    }
  }

  /**
   * Extrait les informations importantes du formulaire (budget, secteur, urgence)
   */
  extractLeadInfo(
    form: Form & { formFields: FormField[] },
    submissionData: Record<string, any>,
  ): {
    budget?: number;
    sector?: string;
    urgency?: 'low' | 'medium' | 'high';
  } {
    const info: any = {};

    for (const field of form.formFields) {
      const fieldValue = submissionData[field.label] || submissionData[field.id];
      const labelLower = field.label.toLowerCase();

      // Budget
      if (labelLower.includes('budget') || labelLower.includes('prix') || labelLower.includes('montant')) {
        const budget = Number(fieldValue);
        if (!isNaN(budget)) {
          info.budget = budget;
        }
      }

      // Secteur
      if (labelLower.includes('secteur') || labelLower.includes('domaine') || labelLower.includes('industrie')) {
        info.sector = String(fieldValue);
      }

      // Urgence
      if (labelLower.includes('urgence') || labelLower.includes('timing') || labelLower.includes('quand')) {
        const urgencyStr = String(fieldValue).toLowerCase();
        if (urgencyStr.includes('urgent') || urgencyStr.includes('immédiat')) {
          info.urgency = 'high';
        } else if (urgencyStr.includes('moyen') || urgencyStr.includes('semaine')) {
          info.urgency = 'medium';
        } else {
          info.urgency = 'low';
        }
      }
    }

    return info;
  }
}


