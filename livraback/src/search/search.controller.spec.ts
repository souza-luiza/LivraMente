import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let service: SearchService;

  beforeEach(async () => {
    const mockSearchService = {
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call SearchService.search with correct query', async () => {
    const query = 'test';
    service.search = jest.fn().mockResolvedValue('mock-result');

    await controller.search(query);

    expect(service.search).toHaveBeenCalledWith(query);
  });

  it('should return the value from SearchService.search', async () => {
    service.search = jest.fn().mockResolvedValue(['result1', 'result2']);

    const res = await controller.search('term');

    expect(res).toEqual(['result1', 'result2']);
  });
});