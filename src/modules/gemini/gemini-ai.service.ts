import { GoogleGenAI } from "@google/genai";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GeminiGenerateDTO } from "./dto/gemini-generate.dto";
import { QuizTag } from "src/common/enum/quizTag";

@Injectable()
export class GeminiAIService {
    private gemini: GoogleGenAI;
    private modelName: string;
    constructor(
        private readonly configService: ConfigService
    ){
        const apiKey = this.configService.get<string>('ai.apiKey')!;
        this.gemini = new GoogleGenAI({apiKey});
        this.modelName = this.configService.get<string>('ai.modelName')!;
    }

    async generateRawQuestions(data: GeminiGenerateDTO): Promise<any[]> {
        const systemInstruction = this.buildSystemInstruction();
        const userPrompt = this.buildUserPrompt(data.questionCount, data.tags, data.prompt);

        try {
            const response = await this.gemini.models.generateContent({
                model: this.modelName,
                contents: userPrompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: 'application/json',
                }
            });

            const jsonText = response.text;
            if (!jsonText) throw new Error('AI không phản hồi dữ liệu');

            return JSON.parse(jsonText);
        } catch (error) {
            console.error('Lỗi core AI service:', error);
            throw new InternalServerErrorException('Không thể kết nối với trí tuệ nhân tạo lúc này.');
        }
    }

    private buildSystemInstruction(): string {
        return `Bạn là một chuyên gia khảo thí giáo dục. Nhiệm vụ của bạn là tạo ra danh sách các câu hỏi trắc nghiệm dựa trên chủ đề người dùng yêu cầu và trả về CHÍNH XÁC cấu trúc mảng JSON được quy định. Không bao gồm ký tự bọc khối code như \`\`\`json, không giải thích dông dài.
        
        Yêu cầu về loại câu hỏi và đáp án:
        - Hãy phân bổ ngẫu nhiên hoặc dựa theo tính chất kiến thức để tạo ra cả câu hỏi dạng chọn một đáp án đúng ("questionType": "SINGLE_CHOICE") và câu hỏi có nhiều đáp án đúng ("questionType": "MULTIPLE_CHOICE").
        - Với SINGLE_CHOICE: Chỉ có duy nhất 1 item có "isCorrect": true.
        - Với MULTIPLE_CHOICE: Bắt buộc phải có từ 2 item trở lên có "isCorrect": true.
        - BẮT BUỘC: Mỗi câu hỏi chỉ được phép có chính xác 4 đáp án trong mảng options.

        Cấu trúc JSON bắt buộc phải trả về là một mảng các câu hỏi có dạng:
        [
        {
            "content": "Nội dung câu hỏi",
            "questionType": "SINGLE_CHOICE" hoặc "MULTIPLE_CHOICE",
            "options": [
            { "content": "Nội dung đáp án", "isCorrect": true hoặc false }
            ]
        }
        ]`;
    }

    private buildUserPrompt(numberOfQuestions: number, tags: QuizTag[], prompt: string): string {
        return `Hãy tạo một danh sách gồm ${numberOfQuestions} câu hỏi trắc nghiệm thuộc thể loại tags: [${tags.join(', ')}] về chủ đề cụ thể sau: "${prompt}".`;
    }
}