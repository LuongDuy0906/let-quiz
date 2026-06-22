import { Module } from '@nestjs/common';
import { GeminiAIService } from './gemini-ai.service';

@Module({
  providers: [GeminiAIService],
  exports: [GeminiAIService]
})
export class GeminiAIModule {}