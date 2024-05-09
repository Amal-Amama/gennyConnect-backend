import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  UseGuards,
  Req,
  Patch,
  Param,
  Res,
  NotFoundException,
  HttpCode,
  HttpStatus,
  HttpException,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  UploadedFiles,
} from '@nestjs/common';
import { SignUpDto } from './dto/signUp.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDemandDto } from './dto/resetPasswordDemandDto.dto';
import { ResetPasswordConfirmationDto } from './dto/resetPasswordConfirmationDto.dto';
import { Request, Response } from 'express';
import { DeletAccountDto } from './dto/deleteAccountDto.dto';
import { UpdateAccountDto } from './dto/updateAccountDto.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import * as path from 'path';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { FileUploadService } from 'src/file_upload/file_upload.service';
import { UserRole } from './schemas/user.schema';
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    _id?: string;
    id?: string;
  };
}
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('signup')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'diplome', maxCount: 1 },
      { name: 'certifications', maxCount: 20 },
      { name: 'logo', maxCount: 1 },
    ]),
  )
  async signUp(
    @UploadedFiles()
    files: {
      diplome?: Express.Multer.File[];
      certifications?: Express.Multer.File[];
      logo?: Express.Multer.File;
    },
    @Body() signUpDto: SignUpDto,
  ) {
    let diplomePath;
    let certificationsPaths = [];
    let logoPath;

    if (signUpDto.role === UserRole.TECHNICIAN) {
      if (files.diplome && files.diplome.length > 0) {
        diplomePath = this.fileUploadService.uploadImage(files.diplome[0]);
      }
      if (files.certifications && files.certifications.length > 0) {
        certificationsPaths = files.certifications.map((file) =>
          this.fileUploadService.uploadImage(file),
        );
      }
    } else if (
      signUpDto.role === UserRole.MAINTENANCE_COMPANY ||
      signUpDto.role === UserRole.CLIENT
    ) {
      if (files.logo) {
        logoPath = this.fileUploadService.uploadImage(files.logo[0]);
      }
    }

    return this.authService.signup(
      logoPath,
      diplomePath,
      certificationsPaths,
      signUpDto,
    );
  }

  @Get('signup/verify/:userId/:uniqueString')
  async verify(
    @Param('userId') userId: string,
    @Param('uniqueString') uniqueString: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.confirmMail(
      userId,
      uniqueString,
      res,
    );
  }
  @Get('signup/verified')
  async getverificationResponse(@Res() res: Response) {
    res.sendFile(path.join(__dirname, '../views/verified.html'));
  }
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post('reset-password')
  resetPasswordDemand(@Body() resetPasswordDemandDto: ResetPasswordDemandDto) {
    return this.authService.resetPasswordDemand(resetPasswordDemandDto);
  }
  @Post('reset-password-confirmation')
  resetPasswordConfirmation(
    @Body() resetPasswordConfirmationDto: ResetPasswordConfirmationDto,
  ) {
    return this.authService.resetPasswordConfirmation(
      resetPasswordConfirmationDto,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  deleteAccount(
    @Req() request: AuthRequest,
    @Body() deleteAccountDto: DeletAccountDto,
  ) {
    const userId = request.user?._id;
    return this.authService.deleteAccount(userId, deleteAccountDto);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('update')
  updateAccount(
    @Req() request: AuthRequest,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    const userId = request.user._id;
    return this.authService.updateAccount(userId, updateAccountDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: AuthRequest) {
    const userId = req.user._id;
    return await this.authService.logout(userId);
  }
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: AuthRequest) {
    const userId = req.user.id;
    console.log(userId);
    const refreshToken = req.user['refreshToken'];
    console.log(refreshToken);

    return this.authService.refreshTokens(userId, refreshToken);
  }
}
