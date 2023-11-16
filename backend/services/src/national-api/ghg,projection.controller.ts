import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Res,
  HttpStatus,
  Get,
} from "@nestjs/common";
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  Action,
  AppAbility,
  CheckPolicies,
  PoliciesGuard,
  JwtAuthGuard,
  ProjectionDto,
  GhgProjectionsService,
  Projection,
} from "@undp/carbon-services-lib";

@ApiTags("Projections")
@ApiBearerAuth()
@Controller("projections")
export class GHGProjectionController {
  constructor(private projectionService: GhgProjectionsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Projection))
  @Post()
  async addProjection(@Body() projection: ProjectionDto, @Request() req, @Res() res: Response) {
    try {
      const response = await this.projectionService.create(projection, req.user);

      // Set the response status and send the response data
      res.status(response.status).json(response.data);
    } catch (error) {
      // Handle errors and set the appropriate status code
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProjections(@Request() req) {
    return await this.projectionService.getAllProjections();
  }

  
}
