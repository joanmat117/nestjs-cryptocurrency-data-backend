import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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

}
