import { ConfirmChannel, ConsumeMessage } from 'amqplib';

/**
 * Interface base para todos os consumers
 * Garante implementação consistente
 */
export interface IQueueConsumer {
  /**
   * Inicializa o consumer e estabelece conexão com RabbitMQ
   */
  inicializar(): Promise<void>;

  /**
   * Processa mensagem recebida da fila
   * @param msg - Mensagem do RabbitMQ
   * @param channel - Canal de comunicação
   */
  processarMensagem(
    msg: ConsumeMessage | null,
    channel: ConfirmChannel,
  ): Promise<void>;

  /**
   * Cleanup ao destruir o módulo
   */
  onModuleDestroy(): Promise<void>;
}
