import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LlmAgentService } from '../src/llm/assistant/llm-agent.service';
import { SessionAuthGuard } from "../src/auth/guards/session-auth.guard"

const mockAgentService = {
  runAnalysisAgent: jest.fn().mockResolvedValue('Resposta simulada do Agente E2E'),
};

const mockSessionAuthGuard = {
  canActivate: (context) => {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'user-id-teste-123', username: 'tester' };
    return true;
  },
};

describe('LlmController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LlmAgentService)
      .useValue(mockAgentService)
      .overrideGuard(SessionAuthGuard)
      .useValue(mockSessionAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(new ValidationPipe());
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // --- Teste de Sucesso ---
  it('/llm/analisar (POST) - Deve retornar resposta do agente', () => {
    return request(app.getHttpServer())
      .post('/llm/analisar')
      .send({
        userPrompt: 'Qual a história mais longa?',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
          response: 'Resposta simulada do Agente E2E',
        });
      });
  });

  it('/llm/analisar (POST) - Deve falhar se userPrompt estiver vazio', () => {
    return request(app.getHttpServer())
      .post('/llm/analisar')
      .send({
        userPrompt: '',
      })
      .expect(400) 
      .expect((res) => {
        expect(res.body.message).toContain('userPrompt should not be empty');
      });
  });
});