import { Controller, Get, Param, Query } from '@nestjs/common';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() q: TableQueryDto) {
    return this.usersService.findAllPaginated(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findByIdSafe(id);
  }
}
