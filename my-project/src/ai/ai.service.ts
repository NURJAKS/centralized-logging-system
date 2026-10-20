import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;

  async getCodeContext(
    filePath: string,
    line: number,
    contextLines = 10,
  ): Promise<string> {
    try {
      const projectRoot = path.resolve(__dirname, '../../..');
      const resolvedPath = path.resolve(projectRoot, filePath);

      if (!resolvedPath.startsWith(projectRoot)) {
        throw new Error('Access denied: Path is outside the project root.');
      }

      const content = await fs.readFile(resolvedPath, 'utf-8');
      const lines = content.split('\n');

      const start = Math.max(0, line - contextLines - 1);
      const end = Math.min(lines.length, line + contextLines);

      return lines
        .slice(start, end)
        .map((l, idx) => `${start + idx + 1}: ${l}`)
        .join('\n');
    } catch (err) {
      this.logger.error(
        `Failed to read file ${filePath}: ${(err as Error).message}`,
      );
      return `Error reading file: ${(err as Error).message}`;
    }
  }

  async getCompletion(prompt: string): Promise<string> {
    if (!this.apiKey) {
      return `### Warning\nAPI key (OPENAI_API_KEY) not configured.\n\n### Analysis\nError analysis will appear here.\n\n### Fix\n\`\`\`typescript\ncode example\n\`\`\``;
    }

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: this.getSystemPrompt() },
              { role: 'user', content: prompt },
            ],
          }),
        },
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.choices[0].message.content;
    } catch (error) {
      this.logger.error(`LLM API Error: ${(error as Error).message}`);
      return `### Error\nFailed to get AI response: ${(error as Error).message}`;
    }
  }

  getSystemPrompt(): string {
    return `You are a Senior Full-Stack Developer and Team Lead analyzing error stack traces and code snippets from a monitoring system.

Your task:
1. Analyze the root cause of the error.
2. Point to the specific line of code where the error occurred.
3. Assess severity (Low, Medium, High, Critical).
4. Propose fixed code in Markdown format.

Respond professionally and concisely. Format:

### Analysis
(problem description)

### Fix
(code)

### Tips
(how to avoid similar errors)`;
  }
}
