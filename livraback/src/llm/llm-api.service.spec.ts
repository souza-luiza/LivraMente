import { Test, TestingModule } from '@nestjs/testing';
import { LlmApiService } from './llm-api.service';

describe('LlmApiService', () => {
  let service: LlmApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlmApiService],
    }).compile();

    service = module.get<LlmApiService>(LlmApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
