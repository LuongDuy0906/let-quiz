import { Test, TestingModule } from '@nestjs/testing';
import { PlayerRecordController } from './player-record.controller';
import { PlayerRecordService } from './player-record.service';

describe('PlayerRecordController', () => {
  let controller: PlayerRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerRecordController],
      providers: [PlayerRecordService],
    }).compile();

    controller = module.get<PlayerRecordController>(PlayerRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
