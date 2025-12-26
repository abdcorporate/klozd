import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class JoinCallDto {
  @IsOptional()
  @IsString()
  displayName?: string;
}

export class StartCallDto {
  @IsOptional()
  @IsBoolean()
  startRecording?: boolean;
}

export class StopCallDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class LivekitWebhookDto {
  event: string;
  room: {
    sid: string;
    name: string;
  };
  recording?: {
    id: string;
    url?: string;
    duration?: number;
    status?: string;
  };
  participant?: {
    sid: string;
    identity: string;
    name?: string;
  };
}




