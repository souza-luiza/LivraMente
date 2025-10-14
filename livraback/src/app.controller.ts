import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Endpoint criado pela CLI do NestJS',
    description: 'Retorna uma mensagem fixa para testes'
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna uma mensagem fixa para testes',
    type: String
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno'
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
