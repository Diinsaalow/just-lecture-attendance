import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CheckPolicies } from '../../common/casl/guards/policies.guard';
import { UpdateHallPolicy } from '../../common/casl/policies/access.policies';
import { HallQrService } from './hall-qr.service';

@Controller('hall-qr')
export class HallQrController {
  constructor(private readonly hallQrService: HallQrService) {}

  /**
   * Generate a static signed QR code payload for a hall.
   * Admin action — used from the Halls management page.
   */
  @Post('halls/:hallId/generate')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies(UpdateHallPolicy)
  generate(@Param('hallId') hallId: string) {
    return this.hallQrService.generateToken(hallId);
  }
}
