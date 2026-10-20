import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';

interface AnalyzeDto {
  logId?: string;
  filePath: string;
  line: number;
  stackTrace: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  async analyzeError(@Body() body: AnalyzeDto) {
    if (!body.filePath || !body.line || !body.stackTrace) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }

    
    const codeSnippet = await this.aiService.getCodeContext(body.filePath, body.line);

    
    const systemPrompt = this.aiService.getSystemPrompt();
    const prompt = `
${systemPrompt}

--- ВВОДНЫЕ ДАННЫЕ ---
Ошибка: ${body.stackTrace}
Файл: ${body.filePath}:${body.line}
Контекст кода:
\`\`\`typescript
${codeSnippet}
\`\`\`
    `;

    
    const analysis = await this.aiService.getCompletion(prompt);

    return {
      success: true,
      analysis: analysis,
    };
  }
}
