import { Module } from '@nestjs/common'

import { ConfigService } from './Config.service'

@Module({
  imports: [],
  controllers: [],
  providers: [
    ConfigService
  ],
  exports: [
    ConfigService
  ]
})
export class ConfigModule { }
