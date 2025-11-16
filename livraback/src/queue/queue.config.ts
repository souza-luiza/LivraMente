import { ConfigService } from '@nestjs/config';

export interface RabbitMQConfig {
  url: string;
  options: {
    heartbeat: number;
    connectionTimeout: number;
  };
}

export const getRabbitMQConfig = (configService: ConfigService): RabbitMQConfig => {
  const url = configService.getOrThrow<string>('RABBITMQ_URL');
  
  return {
    url,
    options: {
      heartbeat: 60, // 60 segundos
      connectionTimeout: 10000, // 10 segundos
    },
  };
};
