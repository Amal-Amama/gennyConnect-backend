import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
type Payload = {
  id;
  email: string;
  role: string[];
  location: string;
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
      ignoreExpiration: false,
    });
  }
  async validate(payload: Payload) {
    const user = await this.userModel.findOne({ email: payload.email });
    if (!user) throw new UnauthorizedException('Unauthorized');
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }
}
