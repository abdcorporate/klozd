import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitations.dto';
import { UserRole, InvitationStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Créer une invitation (ADMIN seulement)
   */
  async createInvitation(organizationId: string, invitedBy: string, createDto: CreateInvitationDto) {
    const { email, role, firstName, lastName } = createDto;

    // Vérifier que le rôle n'est pas ADMIN (seul l'inscription peut créer un ADMIN)
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      throw new BadRequestException('Impossible d\'inviter un utilisateur avec le rôle ADMIN ou SUPER_ADMIN');
    }

    // Vérifier si un utilisateur existe déjà avec cet email
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.organizationId) {
      throw new BadRequestException(
        'Cet utilisateur a déjà un compte dans une autre organisation KLOZD.'
      );
    }

    // Vérifier s'il existe déjà une invitation active pour cet email et cette organisation
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        email,
        organizationId,
        status: {
          in: ['INVITED', 'ACCEPTED'],
        },
      },
    });

    if (existingInvitation) {
      if (existingInvitation.status === 'ACCEPTED') {
        // Si l'utilisateur n'existe plus (a été supprimé), on peut créer une nouvelle invitation
        if (!existingUser) {
          // Marquer l'ancienne invitation comme expirée pour permettre une nouvelle invitation
          await this.prisma.invitation.update({
            where: { id: existingInvitation.id },
            data: { status: 'EXPIRED' },
          });
          // Continuer pour créer la nouvelle invitation
        } else {
          throw new BadRequestException('Cet utilisateur a déjà été invité et a accepté l\'invitation.');
        }
      } else {
        // INVITED : une invitation est déjà en cours
        throw new BadRequestException('Une invitation est déjà en cours pour cet email.');
      }
    }

    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

    // Créer l'invitation
    const invitation = await this.prisma.invitation.create({
      data: {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        organizationId,
        role,
        token,
        expiresAt,
        invitedBy,
        status: 'INVITED',
      },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // Envoyer l'email d'invitation
    try {
      await this.notificationsService.sendInvitationEmail(
        email,
        token,
        invitation.organization.name,
        firstName || 'Utilisateur',
        lastName || '',
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', error);
      // On continue quand même, l'invitation est créée
    }

    return invitation;
  }

  /**
   * Vérifier une invitation par token
   */
  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation non trouvée');
    }

    // Vérifier si l'invitation est expirée
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      // Marquer comme expirée
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Cette invitation a expiré');
    }

    // Vérifier le statut
    if (invitation.status !== 'INVITED') {
      throw new BadRequestException(`Cette invitation a déjà été ${invitation.status.toLowerCase()}`);
    }

    return invitation;
  }

  /**
   * Accepter une invitation
   */
  async acceptInvitation(token: string, acceptDto: AcceptInvitationDto) {
    const { password, confirmPassword, firstName, lastName } = acceptDto;

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // Vérifier l'invitation
    const invitation = await this.getInvitationByToken(token);

    // Vérifier si un utilisateur existe déjà avec cet email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      if (existingUser.organizationId) {
        // L'utilisateur est déjà dans une organisation
        await this.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'CONFLICT' },
        });
        throw new BadRequestException(
          'Ce compte est déjà associé à une autre organisation.'
        );
      }
      // Cas rare : utilisateur sans organisation (ne devrait pas arriver normalement)
      // On met à jour l'utilisateur existant
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          firstName,
          lastName,
          role: invitation.role,
          organizationId: invitation.organizationId,
          emailVerified: true, // Email vérifié automatiquement via invitation
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      });
    } else {
      // Créer un nouvel utilisateur
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.prisma.user.create({
        data: {
          email: invitation.email,
          password: hashedPassword,
          firstName,
          lastName,
          role: invitation.role,
          organizationId: invitation.organizationId,
          status: 'ACTIVE',
          emailVerified: true, // Email vérifié automatiquement via invitation
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      });
    }

    // Marquer l'invitation comme acceptée
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    // Marquer toutes les autres invitations pour cet email comme CONFLICT ou EXPIRED
    await this.prisma.invitation.updateMany({
      where: {
        email: invitation.email,
        id: { not: invitation.id },
        status: 'INVITED',
      },
      data: { status: 'CONFLICT' },
    });

    return {
      message: 'Invitation acceptée avec succès',
      organizationId: invitation.organizationId,
      organizationName: invitation.organization.name,
    };
  }

  /**
   * Lister les invitations d'une organisation (ADMIN seulement)
   */
  async findAll(organizationId: string) {
    return this.prisma.invitation.findMany({
      where: { organizationId },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Annuler une invitation
   */
  async cancelInvitation(invitationId: string, organizationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation non trouvée');
    }

    if (invitation.status !== 'INVITED') {
      throw new BadRequestException('Seules les invitations en attente peuvent être annulées');
    }

    return this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'DECLINED' },
    });
  }

  /**
   * Renvoyer une invitation (génère un nouveau token et renvoie l'email)
   */
  async resendInvitation(invitationId: string, organizationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
      },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation non trouvée');
    }

    // Vérifier que l'invitation est en statut INVITED ou EXPIRED
    if (invitation.status !== 'INVITED' && invitation.status !== 'EXPIRED') {
      throw new BadRequestException('Seules les invitations en attente ou expirées peuvent être renvoyées');
    }

    // Vérifier si un utilisateur existe déjà avec cet email et une organisation
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser && existingUser.organizationId) {
      throw new BadRequestException(
        'Cet utilisateur a déjà un compte dans une organisation. Impossible de renvoyer l\'invitation.'
      );
    }

    // Générer un nouveau token
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7); // Expire dans 7 jours

    // Mettre à jour l'invitation avec le nouveau token
    const updatedInvitation = await this.prisma.invitation.update({
      where: { id: invitationId },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
        status: 'INVITED', // Remettre en INVITED si elle était expirée
      },
    });

    // Renvoyer l'email d'invitation
    try {
      await this.notificationsService.sendInvitationEmail(
        invitation.email,
        newToken,
        invitation.organization.name,
        invitation.firstName || 'Utilisateur',
        invitation.lastName || '',
      );
      console.log(`✅ Invitation renvoyée à ${invitation.email}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', error);
      // On continue quand même, l'invitation est mise à jour
    }

    return updatedInvitation;
  }
}

