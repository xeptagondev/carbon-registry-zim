import { Body, Controller, Get, Post, Put, Query, UseGuards, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Action } from "src/casl/action.enum";
import { AppAbility } from "src/casl/casl-ability.factory";
import { CheckPolicies } from "src/casl/policy.decorator";
import { PoliciesGuard, PoliciesGuardEx } from "src/casl/policy.guard";
import { ProgrammeSl } from "../entities/programmeSl.entity";
import { ProgrammeSlService } from "../programme-sl/programme-sl.service";
import { ProgrammeSlDto } from "../dto/programmeSl.dto";

@ApiTags("ProgrammeSl")
@ApiBearerAuth()
@Controller("programmeSl")
export class ProgrammeSlController {
  constructor(private programmeService: ProgrammeSlService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, ProgrammeSl))
  @Post("create")
  async addProgramme(@Body() programme: ProgrammeSlDto, @Request() req) {
    global.baseUrl = `${req.protocol}://${req.get("Host")}`;
    return this.programmeService.create(programme, req.user);
  }
}