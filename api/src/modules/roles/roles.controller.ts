import { Controller, Get, Query } from '@nestjs/common';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(@Query() q: TableQueryDto) {
    return this.rolesService.findAllPaginated(q);
  }
}
