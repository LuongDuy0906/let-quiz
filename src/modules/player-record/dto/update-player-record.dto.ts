import { PartialType } from '@nestjs/swagger';
import { CreatePlayerRecordDto } from './create-player-record.dto';

export class UpdatePlayerRecordDto extends PartialType(CreatePlayerRecordDto) {}
