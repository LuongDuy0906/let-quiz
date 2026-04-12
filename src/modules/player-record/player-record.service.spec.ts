import { Test, TestingModule } from '@nestjs/testing';
import { PlayerRecordService } from './player-record.service';

describe('PlayerRecordService', () => {
  let service: PlayerRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerRecordService],
    }).compile();

    service = module.get<PlayerRecordService>(PlayerRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
