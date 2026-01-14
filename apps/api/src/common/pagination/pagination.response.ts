import { ApiProperty } from '@nestjs/swagger';

export class PageInfo {
  @ApiProperty({
    description: 'Nombre d\'éléments demandés',
    example: 25,
  })
  limit: number;

  @ApiProperty({
    description: 'Curseur pour la page suivante (null si dernière page)',
    example: 'eyJpZCI6ImN1aWQxMjMiLCJjcmVhdGVkQXQiOiIyMDI0LTAxLTAxVDAwOjAwOjAwLjAwMFoifQ==',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({
    description: 'Indique s\'il y a une page suivante',
    example: true,
  })
  hasNextPage: boolean;
}

export class PaginatedResponse<T> {
  @ApiProperty({
    description: 'Liste des éléments',
    isArray: true,
    type: 'array',
  })
  items: T[];

  @ApiProperty({
    description: 'Informations de pagination',
    type: PageInfo,
  })
  pageInfo: PageInfo;

  constructor(items: T[], limit: number, nextCursor: string | null) {
    this.items = items;
    this.pageInfo = {
      limit,
      nextCursor,
      hasNextPage: nextCursor !== null,
    };
  }
}
