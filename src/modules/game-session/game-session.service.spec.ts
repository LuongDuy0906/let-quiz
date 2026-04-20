import { Test, TestingModule } from '@nestjs/testing';
import { GameSessionService } from './service/game-session.service';

describe('GameSessionService', () => {
  let service: GameSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameSessionService],
    }).compile();

    service = module.get<GameSessionService>(GameSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
