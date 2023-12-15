import { Controller, Get } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CurrentUser } from './current-user.decorator';
import { UserCredentials } from './user-credentials';

@Controller('auth')
export class AuthController {
  constructor(private readonly UserProfileService: UserProfileService) {}

  @Get('/profile')
  async getProfile(@CurrentUser() user: UserCredentials) {
    return this.UserProfileService.getUserProfile(user);
  }
}
