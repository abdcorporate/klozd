import { Injectable } from '@nestjs/common';

export interface PricingPlan {
  name: string;
  monthlyPrice: number;
  maxUsers: number;
  maxForms: number;
  maxLeadsPerMonth: number;
  maxAppointmentsPerMonth: number;
  maxSmsPerMonth: number;
  aiEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
}

@Injectable()
export class PricingService {
  private readonly plans: Record<string, PricingPlan> = {
    solo: {
      name: 'Solo',
      monthlyPrice: 97,
      maxUsers: 3,
      maxForms: 5,
      maxLeadsPerMonth: 500,
      maxAppointmentsPerMonth: 100,
      maxSmsPerMonth: 100,
      aiEnabled: true,
      whatsappEnabled: false,
      smsEnabled: true,
    },
    pro: {
      name: 'Pro',
      monthlyPrice: 147,
      maxUsers: 10,
      maxForms: 15,
      maxLeadsPerMonth: 2000,
      maxAppointmentsPerMonth: 500,
      maxSmsPerMonth: 500,
      aiEnabled: true,
      whatsappEnabled: true,
      smsEnabled: true,
    },
    business: {
      name: 'Business',
      monthlyPrice: 197,
      maxUsers: 25,
      maxForms: 50,
      maxLeadsPerMonth: 10000,
      maxAppointmentsPerMonth: 2000,
      maxSmsPerMonth: 2000,
      aiEnabled: true,
      whatsappEnabled: true,
      smsEnabled: true,
    },
  };

  getPlan(planName: string): PricingPlan | null {
    return this.plans[planName] || null;
  }

  getAllPlans(): Record<string, PricingPlan> {
    return this.plans;
  }

  getPlanFeatures(planName: string): Partial<PricingPlan> {
    const plan = this.getPlan(planName);
    if (!plan) {
      return {};
    }

    return {
      maxUsers: plan.maxUsers,
      maxForms: plan.maxForms,
      maxLeadsPerMonth: plan.maxLeadsPerMonth,
      maxAppointmentsPerMonth: plan.maxAppointmentsPerMonth,
      maxSmsPerMonth: plan.maxSmsPerMonth,
      aiEnabled: plan.aiEnabled,
      whatsappEnabled: plan.whatsappEnabled,
      smsEnabled: plan.smsEnabled,
    };
  }

  upgradePlan(currentPlan: string): string | null {
    const planOrder = ['solo', 'pro', 'business'];
    const currentIndex = planOrder.indexOf(currentPlan);
    if (currentIndex === -1 || currentIndex === planOrder.length - 1) {
      return null;
    }
    return planOrder[currentIndex + 1];
  }

  downgradePlan(currentPlan: string): string | null {
    const planOrder = ['solo', 'pro', 'business'];
    const currentIndex = planOrder.indexOf(currentPlan);
    if (currentIndex === -1 || currentIndex === 0) {
      return null;
    }
    return planOrder[currentIndex - 1];
  }
}




