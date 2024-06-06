import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/config/decorator/roles.decorator';
import { UserRole } from 'src/auth/schemas/user.schema';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(UserRole.ADMIN)
  async getAllUser() {
    return await this.userService.findAll();
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('roles')
  @Roles(UserRole.ADMIN)
  async getUsersByRole() {
    return await this.userService.findByRole();
  }
  @UseGuards(JwtAuthGuard, AccessTokenGuard)
  @Get(':uid')
  async getOneUser(@Param('uid') userId: string) {
    return await this.userService.findOneUser(userId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':uid')
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('uid') userId: string) {
    await this.userService.deleteUser(userId);
    return { message: 'User and associated details deleted successfully' };
  }
}
