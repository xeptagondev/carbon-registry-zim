import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NationalAPIController } from './national.api.controller';
import { NationalAPIService } from './national.api.service';
import configuration from '../shared/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../shared/typeorm.config.service';
// import { Programme } from './entities/programme.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../shared/rbac/roles.guard';
import { CaslModule } from '../shared/casl/casl.module';
import { ProgrammeModule } from './programme/programme.module';
import { ProgrammeLedgerModule } from '../shared/programme-ledger/programme-ledger.module';
import { LedgerDbModule } from '../shared/ledger-db/ledger-db.module';
import { UtilModule } from '../shared/util/util.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [`.env.${process.env.NODE_ENV}`, `.env`]
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    AuthModule,
    UserModule,
    CaslModule,
    ProgrammeModule,
    CompanyModule
  ],
  controllers: [NationalAPIController],
  providers: [
    NationalAPIService, 
    Logger
  ],
})
export class NationalAPIModule {}