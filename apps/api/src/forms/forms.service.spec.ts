import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { FormsService } from './forms.service';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../settings/pricing.service';
import { CreateFormDto, UpdateFormDto, FormStatus } from './dto/forms.dto';

describe('FormsService - Tests Complets', () => {
  let service: FormsService;
  let prismaService: PrismaService;
  let pricingService: PricingService;

  const mockPrismaService = {
    form: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    formField: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
    organizationSettings: {
      findUnique: jest.fn(),
    },
  };

  const mockPricingService = {
    getAllPlans: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PricingService,
          useValue: mockPricingService,
        },
      ],
    }).compile();

    service = module.get<FormsService>(FormsService);
    prismaService = module.get<PrismaService>(PrismaService);
    pricingService = module.get<PricingService>(PricingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Création de formulaires', () => {
    const organizationId = 'org-123';

    it('devrait créer un formulaire simple avec champs de base', async () => {
      const createFormDto: CreateFormDto = {
        name: 'Formulaire de Contact',
        slug: 'contact',
        description: 'Formulaire pour capturer les contacts',
        status: FormStatus.ACTIVE,
        minScore: 50,
        formFields: [
          {
            label: 'Prénom',
            type: 'TEXT',
            required: true,
            order: 1,
          },
          {
            label: 'Nom',
            type: 'TEXT',
            required: true,
            order: 2,
          },
          {
            label: 'Email',
            type: 'EMAIL',
            required: true,
            order: 3,
          },
          {
            label: 'Téléphone',
            type: 'PHONE',
            required: false,
            order: 4,
          },
        ],
      };

      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxForms: 10,
      });
      mockPrismaService.form.count.mockResolvedValue(2);
      
      const createdForm = {
        id: 'form-123',
        ...createFormDto,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.form.create.mockResolvedValue(createdForm);
      mockPrismaService.formField.createMany.mockResolvedValue({ count: 4 });
      mockPrismaService.form.findUnique.mockResolvedValue({
        ...createdForm,
        formFields: createFormDto.formFields.map((field, index) => ({
          id: `field-${index}`,
          ...field,
          formId: 'form-123',
        })),
      });

      const result = await service.create(organizationId, createFormDto);

      expect(result).toHaveProperty('id', 'form-123');
      expect(result).toHaveProperty('name', 'Formulaire de Contact');
      expect(result).toHaveProperty('slug', 'contact');
      expect(result.formFields).toHaveLength(4);
      expect(mockPrismaService.form.create).toHaveBeenCalled();
      expect(mockPrismaService.formField.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ label: 'Prénom', type: 'TEXT', required: true }),
          expect.objectContaining({ label: 'Email', type: 'EMAIL', required: true }),
        ]),
      });
    });

    it('devrait créer un formulaire avec règles de scoring avancées', async () => {
      const scoringRules = JSON.stringify([
        { field: 'budget', operator: 'gte', value: 10000, points: 30 },
        { field: 'sector', operator: 'eq', value: 'tech', points: 20 },
        { field: 'urgency', operator: 'eq', value: 'high', points: 25 },
      ]);

      const createFormDto: CreateFormDto = {
        name: 'Formulaire Qualification',
        slug: 'qualification',
        status: FormStatus.ACTIVE,
        minScore: 50,
        formFields: [
          {
            label: 'Budget',
            type: 'NUMBER',
            required: true,
            order: 1,
            scoringRulesJson: scoringRules,
          },
          {
            label: 'Secteur',
            type: 'SELECT',
            required: true,
            order: 2,
            optionsJson: JSON.stringify(['tech', 'finance', 'retail']),
            scoringRulesJson: scoringRules,
          },
          {
            label: 'Urgence',
            type: 'SELECT',
            required: true,
            order: 3,
            optionsJson: JSON.stringify(['low', 'medium', 'high']),
            scoringRulesJson: scoringRules,
          },
        ],
      };

      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxForms: 10,
      });
      mockPrismaService.form.count.mockResolvedValue(1);

      const createdForm = {
        id: 'form-456',
        ...createFormDto,
        organizationId,
      };

      mockPrismaService.form.create.mockResolvedValue(createdForm);
      mockPrismaService.formField.createMany.mockResolvedValue({ count: 3 });
      mockPrismaService.form.findUnique.mockResolvedValue({
        ...createdForm,
        formFields: createFormDto.formFields.map((field, index) => ({
          id: `field-${index}`,
          ...field,
          formId: 'form-456',
        })),
      });

      const result = await service.create(organizationId, createFormDto);

      expect(result.formFields).toHaveLength(3);
      expect(result.formFields[0]).toHaveProperty('scoringRulesJson', scoringRules);
      expect(mockPrismaService.formField.createMany).toHaveBeenCalled();
    });

    it('devrait créer un formulaire avec redirections conditionnelles', async () => {
      const createFormDto: CreateFormDto = {
        name: 'Formulaire avec Redirections',
        slug: 'redirect-form',
        status: FormStatus.ACTIVE,
        minScore: 60,
        qualifiedRedirectUrl: 'https://example.com/merci',
        disqualifiedRedirectUrl: 'https://example.com/desole',
        disqualificationMessage: 'Désolé, vous ne remplissez pas les critères.',
        formFields: [
          {
            label: 'Revenu mensuel',
            type: 'NUMBER',
            required: true,
            order: 1,
          },
        ],
      };

      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxForms: 10,
      });
      mockPrismaService.form.count.mockResolvedValue(0);

      const createdForm = {
        id: 'form-789',
        ...createFormDto,
        organizationId,
      };

      mockPrismaService.form.create.mockResolvedValue(createdForm);
      mockPrismaService.formField.createMany.mockResolvedValue({ count: 1 });
      mockPrismaService.form.findUnique.mockResolvedValue({
        ...createdForm,
        formFields: [],
      });

      const result = await service.create(organizationId, createFormDto);

      expect(result).toHaveProperty('qualifiedRedirectUrl', 'https://example.com/merci');
      expect(result).toHaveProperty('disqualifiedRedirectUrl', 'https://example.com/desole');
      expect(result).toHaveProperty('disqualificationMessage');
    });

    it('devrait créer un formulaire avec capture d\'abandons activée', async () => {
      const createFormDto: CreateFormDto = {
        name: 'Formulaire avec Abandons',
        slug: 'abandon-form',
        status: FormStatus.ACTIVE,
        captureAbandons: true,
        abandonmentDelay: 30000, // 30 secondes
        formFields: [
          {
            label: 'Email',
            type: 'EMAIL',
            required: true,
            order: 1,
          },
        ],
      };

      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxForms: 10,
      });
      mockPrismaService.form.count.mockResolvedValue(3);

      const createdForm = {
        id: 'form-abandon',
        ...createFormDto,
        organizationId,
      };

      mockPrismaService.form.create.mockResolvedValue(createdForm);
      mockPrismaService.formField.createMany.mockResolvedValue({ count: 1 });
      mockPrismaService.form.findUnique.mockResolvedValue({
        ...createdForm,
        formFields: [],
      });

      const result = await service.create(organizationId, createFormDto);

      expect(result).toHaveProperty('captureAbandons', true);
      expect(result).toHaveProperty('abandonmentDelay', 30000);
    });

    it('devrait rejeter la création si quota de formulaires atteint', async () => {
      const createFormDto: CreateFormDto = {
        name: 'Formulaire Test',
        slug: 'test',
        status: FormStatus.ACTIVE,
      };

      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxForms: 5,
      });
      mockPrismaService.form.count.mockResolvedValue(5);

      await expect(service.create(organizationId, createFormDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.form.create).not.toHaveBeenCalled();
    });
  });

  describe('Récupération de formulaires', () => {
    const organizationId = 'org-123';

    it('devrait récupérer tous les formulaires avec leurs statistiques', async () => {
      const mockForms = [
        {
          id: 'form-1',
          name: 'Formulaire 1',
          organizationId,
          status: FormStatus.ACTIVE,
          formFields: [],
          _count: {
            submissions: 150,
            leads: 120,
          },
        },
        {
          id: 'form-2',
          name: 'Formulaire 2',
          organizationId,
          status: FormStatus.PAUSED,
          formFields: [],
          _count: {
            submissions: 80,
            leads: 65,
          },
        },
      ];

      mockPrismaService.form.findMany.mockResolvedValue(mockForms);

      const result = await service.findAll(organizationId);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('_count');
      expect(result[0]._count).toHaveProperty('submissions', 150);
      expect(result[0]._count).toHaveProperty('leads', 120);
      expect(mockPrismaService.form.findMany).toHaveBeenCalledWith({
        where: { organizationId },
        include: expect.objectContaining({
          formFields: expect.any(Object),
          _count: expect.any(Object),
        }),
      });
    });

    it('devrait récupérer un formulaire par ID avec tous ses champs', async () => {
      const formId = 'form-123';
      const mockForm = {
        id: formId,
        name: 'Formulaire Complet',
        organizationId,
        status: FormStatus.ACTIVE,
        formFields: [
          {
            id: 'field-1',
            label: 'Prénom',
            type: 'TEXT',
            required: true,
            order: 1,
          },
          {
            id: 'field-2',
            label: 'Email',
            type: 'EMAIL',
            required: true,
            order: 2,
          },
        ],
      };

      mockPrismaService.form.findFirst.mockResolvedValue(mockForm);

      const result = await service.findOne(formId, organizationId);

      expect(result).toEqual(mockForm);
      expect(result.formFields).toHaveLength(2);
      expect(result.formFields[0].order).toBeLessThan(result.formFields[1].order);
    });

    it('devrait récupérer un formulaire par slug (public)', async () => {
      const slug = 'contact-form';
      const mockForm = {
        id: 'form-public',
        name: 'Formulaire Public',
        slug,
        status: FormStatus.ACTIVE,
        formFields: [],
      };

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);

      const result = await service.findBySlug(slug);

      expect(result).toEqual(mockForm);
      expect(mockPrismaService.form.findUnique).toHaveBeenCalledWith({
        where: { slug },
        include: expect.any(Object),
      });
    });

    it('devrait lancer NotFoundException si formulaire non trouvé', async () => {
      mockPrismaService.form.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent', organizationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Mise à jour de formulaires', () => {
    const organizationId = 'org-123';
    const formId = 'form-123';

    it('devrait mettre à jour un formulaire et ses champs', async () => {
      const existingForm = {
        id: formId,
        name: 'Ancien Nom',
        organizationId,
        status: FormStatus.ACTIVE,
        formFields: [
          { id: 'field-1', label: 'Ancien Champ', type: 'TEXT', order: 1 },
        ],
      };

      const updateDto: UpdateFormDto = {
        name: 'Nouveau Nom',
        status: FormStatus.PAUSED,
        formFields: [
          {
            label: 'Nouveau Champ',
            type: 'EMAIL',
            required: true,
            order: 1,
          },
        ],
      };

      mockPrismaService.form.findFirst.mockResolvedValue(existingForm);
      mockPrismaService.form.update.mockResolvedValue({
        ...existingForm,
        ...updateDto,
        formFields: [],
      });

      const result = await service.update(formId, organizationId, updateDto);

      expect(result).toHaveProperty('name', 'Nouveau Nom');
      expect(result).toHaveProperty('status', FormStatus.PAUSED);
      expect(mockPrismaService.form.update).toHaveBeenCalled();
    });

    it('devrait mettre à jour uniquement les champs spécifiés', async () => {
      const existingForm = {
        id: formId,
        name: 'Formulaire',
        description: 'Description originale',
        organizationId,
        status: FormStatus.ACTIVE,
        formFields: [],
      };

      const updateDto: UpdateFormDto = {
        description: 'Nouvelle description',
      };

      mockPrismaService.form.findFirst.mockResolvedValue(existingForm);
      mockPrismaService.form.update.mockResolvedValue({
        ...existingForm,
        ...updateDto,
      });
      mockPrismaService.form.findUnique.mockResolvedValue({
        ...existingForm,
        ...updateDto,
        formFields: [],
      });

      const result = await service.update(formId, organizationId, updateDto);

      expect(result).toHaveProperty('description', 'Nouvelle description');
      expect(result).toHaveProperty('name', 'Formulaire'); // Inchangé
    });
  });

  describe('Suppression de formulaires', () => {
    const organizationId = 'org-123';
    const formId = 'form-123';

    it('devrait supprimer un formulaire et ses champs associés', async () => {
      const existingForm = {
        id: formId,
        organizationId,
        formFields: [{ id: 'field-1' }, { id: 'field-2' }],
      };

      mockPrismaService.form.findFirst.mockResolvedValue(existingForm);
      mockPrismaService.form.delete.mockResolvedValue(existingForm);

      const result = await service.remove(formId, organizationId);

      expect(result).toEqual(existingForm);
      expect(mockPrismaService.form.delete).toHaveBeenCalledWith({
        where: { id: formId },
      });
      // Les formFields sont supprimés en cascade par Prisma (relation onDelete: Cascade)
    });

    it('devrait lancer NotFoundException si formulaire non trouvé lors de la suppression', async () => {
      mockPrismaService.form.findFirst.mockResolvedValue(null);

      await expect(service.remove('non-existent', organizationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Gestion des statuts de formulaire', () => {
    const organizationId = 'org-123';

    it('devrait créer un formulaire en brouillon', async () => {
      const createFormDto: CreateFormDto = {
        name: 'Brouillon',
        slug: 'draft',
        status: FormStatus.DRAFT,
      };

      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxForms: 10,
      });
      mockPrismaService.form.count.mockResolvedValue(0);

      const createdForm = {
        id: 'form-draft',
        ...createFormDto,
        organizationId,
      };

      mockPrismaService.form.create.mockResolvedValue(createdForm);
      mockPrismaService.form.findUnique.mockResolvedValue({
        ...createdForm,
        formFields: [],
      });

      const result = await service.create(organizationId, createFormDto);

      expect(result).toHaveProperty('status', FormStatus.DRAFT);
    });

    it('devrait activer un formulaire en brouillon', async () => {
      const formId = 'form-draft';
      const existingForm = {
        id: formId,
        organizationId,
        status: FormStatus.DRAFT,
        formFields: [],
      };

      mockPrismaService.form.findFirst.mockResolvedValue(existingForm);
      mockPrismaService.form.update.mockResolvedValue({
        ...existingForm,
        status: FormStatus.ACTIVE,
      });
      mockPrismaService.form.findUnique.mockResolvedValue({
        ...existingForm,
        status: FormStatus.ACTIVE,
        formFields: [],
      });

      const result = await service.update(formId, organizationId, {
        status: FormStatus.ACTIVE,
      });

      expect(result).toHaveProperty('status', FormStatus.ACTIVE);
    });
  });

  describe('Validation et règles métier', () => {
    const organizationId = 'org-123';

    it('devrait valider que le slug est unique', async () => {
      const createFormDto: CreateFormDto = {
        name: 'Formulaire',
        slug: 'existing-slug',
        status: FormStatus.ACTIVE,
      };

      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxForms: 10,
      });
      mockPrismaService.form.count.mockResolvedValue(0);
      
      // Simuler un conflit de slug (Prisma lèvera une erreur)
      const prismaError = new Error('Unique constraint failed on the fields: (`slug`)');
      (prismaError as any).code = 'P2002';
      (prismaError as any).meta = { target: ['slug'] };
      mockPrismaService.form.create.mockRejectedValue(prismaError);

      await expect(service.create(organizationId, createFormDto)).rejects.toThrow('Unique constraint');
      expect(mockPrismaService.form.create).toHaveBeenCalled();
    });

    it('devrait gérer les formulaires avec champs conditionnels', async () => {
      const createFormDto: CreateFormDto = {
        name: 'Formulaire Conditionnel',
        slug: 'conditional',
        status: FormStatus.ACTIVE,
        formFields: [
          {
            label: 'Type de demande',
            type: 'SELECT',
            required: true,
            order: 1,
            optionsJson: JSON.stringify(['support', 'vente', 'autre']),
          },
          {
            label: 'Détails (si autre)',
            type: 'TEXT',
            required: false,
            order: 2,
          },
        ],
      };

      mockPrismaService.organizationSettings.findUnique.mockResolvedValue({
        maxForms: 10,
      });
      mockPrismaService.form.count.mockResolvedValue(1);

      const createdForm = {
        id: 'form-conditional',
        ...createFormDto,
        organizationId,
      };

      mockPrismaService.form.create.mockResolvedValue(createdForm);
      mockPrismaService.formField.createMany.mockResolvedValue({ count: 2 });
      mockPrismaService.form.findUnique.mockResolvedValue({
        ...createdForm,
        formFields: createFormDto.formFields.map((field, index) => ({
          id: `field-${index}`,
          ...field,
          formId: 'form-conditional',
        })),
      });

      const result = await service.create(organizationId, createFormDto);

      expect(result.formFields).toHaveLength(2);
      expect(result.formFields[1].required).toBe(false);
    });
  });
});
