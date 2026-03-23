import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { generatePasswordWithOptions } from 'password-generator';
import config from './common/config';

@ApiTags('Health & Utilities')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the API server',
  })
  @ApiResponse({
    status: 200,
    description: 'Server is healthy',
    schema: {
      example: {
        ok: true,
        message: 'Everything is alright',
        date: 'Mon, 23 Mar 2026 21:00:30 GMT',
      },
    },
  })
  health(): any {
    return {
      ok: true,
      message: 'Everything is alright',
      date: new Date().toUTCString(),
    };
  }

  @Get('random-password')
  @ApiOperation({
    summary: 'Generate random secret phrase',
    description:
      'Generates a random memorable secret phrase that can be used for authentication',
  })
  @ApiResponse({
    status: 200,
    description: 'Random phrase generated successfully',
    schema: {
      example: {
        phrase: 'correct horse battery staple',
      },
    },
  })
  async genPhrase(): Promise<any> {
    const phrase = await generatePasswordWithOptions({
      words: config.secretPhrase.words,
      memorable: config.secretPhrase.memorable,
    });

    return {
      phrase,
    };
  }
}
