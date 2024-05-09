import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { Model } from 'mongoose';
import { User, UserStatut } from './schemas/user.schema';
import { SignUpDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from 'src/mailer/mailer.service';
import { ResetPasswordDemandDto } from './dto/resetPasswordDemandDto.dto';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordConfirmationDto } from './dto/resetPasswordConfirmationDto.dto';
import { DeletAccountDto } from './dto/deleteAccountDto.dto';
import { UpdateAccountDto } from './dto/updateAccountDto.dto';
import { v4 as uuidv4 } from 'uuid';
import { UserVerification } from './schemas/userVerification.schema';
import { Response } from 'express';
import * as path from 'path';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(UserVerification.name)
    private userVerificationModel: Model<UserVerification>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async signup(
    logoPath: string,
    diplomePath: string,
    certificationsPaths: string[],
    signupDto: SignUpDto,
  ) {
    const { email, role } = signupDto;
    let existingUser;
    try {
      existingUser = await this.userModel.findOne({ email });
    } catch (err) {
      throw new HttpException(
        'Signing up failed, please try again later!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (existingUser) {
      throw new ConflictException('User exists already, please login instead.');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    let score = 0;
    if (role === 'technician') {
      if (signupDto.yearsOfExperience > 0) {
        score += signupDto.yearsOfExperience * 10;
      }
      if (signupDto.diplome) {
        score += 15;
      }
      if (signupDto.certifications) {
        score += signupDto.certifications.length * 5;
      }
      if (signupDto.spokenLanguages) {
        score += signupDto.spokenLanguages.length * 2;
      }
    } else if (role === 'maintenance_company' || role === 'client') {
      score = 0;
    }
    //enregister user dans le base de données
    const user = await this.userModel.create({
      ...signupDto,
      diplome: diplomePath,
      logo: logoPath,
      certifications: certificationsPaths,
      password: hashedPassword,
      score: score,
      emailConfirmed: false,
    });
    try {
      await user.save();
    } catch (err) {
      throw new HttpException(
        'Signing up failed, please try again later!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    //creation de user verification for this user
    const uniqueString = `${user._id}-${uuidv4()}`;
    const hashedUniqueString = await bcrypt.hash(uniqueString, 10);
    const userVerification = await this.userVerificationModel.create({
      userId: user._id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expireAt: Date.now() + 21600000,
    });
    await userVerification.save();
    //envoyer une mail de confirmation
    const confirmationLink = `${process.env.APP_URL}/auth/signup/verify/${user._id}/${uniqueString}`;

    await this.mailerService.sendingSignupConfirmation(email, confirmationLink);

    return {
      message: 'user Successfully registred',
      user: user.toObject({ getters: true }),
    };
  }
  async confirmMail(userId: string, uniqueString: string, res: Response) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userVerification = await this.userVerificationModel
      .findOne({
        userId,
      })
      .exec()
      .then()
      .catch((error) => {
        console.log(error);
        let message =
          'an erreur occured while checking for exisxting user verification record';
        res.redirect(`/auth/signup/verified?error=true&message=${message}`);
      });
    if (!userVerification) {
      let message =
        ' Account record does not exist or has been verified already, please signup or login';
      res.redirect(`/auth/signup/verified?error=true&message=${message}`);
      throw new NotFoundException(
        'Account record does not exist or has been verified already, please signup or login',
      );
    } else if (userVerification) {
      if (userVerification.expireAt.getTime() < Date.now()) {
        await Promise.all([
          this.userVerificationModel.deleteOne({ userId }),
          this.userModel.findByIdAndDelete(userId),
        ]);
        let message = 'link has expired , please signup again!';
        res.redirect(`/auth/signup/verified?error=true&message=${message}`);
      } else {
        const isMatch = await bcrypt.compare(
          uniqueString,
          userVerification.uniqueString,
        );
        if (!isMatch) {
          throw new BadRequestException('Invalid verification link');
        } else {
          await this.userVerificationModel.deleteOne({ userId });
          user.emailConfirmed = true;
          await user.save();
          res.sendFile(path.join(__dirname, '../views/verified.html'));
        }
      }
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    let user;
    try {
      user = await this.userModel.findOne({ email });
    } catch (err) {
      throw new HttpException(
        'Loggin in is failed, please try again later!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!user) {
      throw new NotFoundException(
        'User not found,Please signup and confirm you account first',
      );
    }
    if (!user.emailConfirmed) {
      throw new UnauthorizedException(
        'Email not confirmed,Please confirm your email first before 6 hours',
      );
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException(
          'Password does not match,could not log you in.',
        );
      }
      user.statut = UserStatut.ONLINE;
      await user.save();
      // Generate tokens
      const tokens = await this.getTokens(
        user._id,
        user.email,
        user.role,
        user.location,
      );

      // Update refreshToken in the database
      await this.updateRefreshToken(user._id, tokens.refreshToken);
      console.log(tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        message: 'Logged in successfully!',
        user: user.toObject({ getters: true }),
      };
    }
  }

  async resetPasswordDemand(resetPasswordDemandDto: ResetPasswordDemandDto) {
    const { email } = resetPasswordDemandDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('user not found');
    //speakeasy pour generer code a fin de changer mot de passe
    const code = speakeasy.totp({
      secret: this.configService.get('OTP_CODE'),
      digits: 5,
      step: 60 * 15, //15 min
      encoding: 'base32',
    });
    const url = 'http://localhost:3000/confirmResetPS';
    await this.mailerService.sendResetPassword(email, url, code);
    return { message: 'reset password email has been sent' };
  }
  async resetPasswordConfirmation(
    ResetPasswordConfirmationDto: ResetPasswordConfirmationDto,
  ) {
    const { email, code, password } = ResetPasswordConfirmationDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    const match = speakeasy.totp.verify({
      secret: this.configService.get('OTP_CODE'),
      token: code,
      digits: 5,
      step: 60 * 15, // 15 min
      encoding: 'base32',
    });
    if (!match) throw new UnauthorizedException('Invalid or expired token');

    const newHashedPassword = await bcrypt.hash(password, 10);

    // Utilisez la méthode save() pour mettre à jour le mot de passe de l'utilisateur
    user.password = newHashedPassword;
    await user.save();

    return { message: 'Password updated successfully!' };
  }
  async deleteAccount(userId: string, deleteAccountDto: DeletAccountDto) {
    const { password } = deleteAccountDto;
    const user = await this.userModel.findOne({ _id: userId });
    // console.log('user:', user);
    if (!user) throw new NotFoundException('User not found');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      //  throw new Error('Invalid email or password');
      throw new UnauthorizedException('password does not match');
    }
    await this.userModel.deleteOne({ _id: userId });
    return { data: 'user successfully deleted' };
  }
  async updateAccount(userId, updateAccountDto: UpdateAccountDto) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      updateAccountDto,
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { data: 'User successfully updated' };
  }
  async logout(userId: string) {
    const user = this.userModel.findOneAndUpdate(
      { _id: userId, refreshToken: { $ne: null } },
      { $set: { refreshToken: null, statut: UserStatut.OFFLINE } },
    );
    // console.log(user);

    return user;
  }
  async updateRefreshToken(userId, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    //   console.log(refreshToken);

    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    });
  }
  async getTokens(
    userId,
    userEmail: string,
    userRole: string[],
    userLocation: string,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
          email: userEmail,
          role: userRole,
          location: userLocation,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
          email: userEmail,
          role: userRole,
          location: userLocation,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.location,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
