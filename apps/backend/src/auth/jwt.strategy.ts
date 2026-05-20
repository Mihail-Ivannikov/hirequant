import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${config.get("AUTH0_ISSUER_URL")}.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: config.get("AUTH0_AUDIENCE"),
      issuer: config.get("AUTH0_ISSUER_URL"),
      algorithms: ["RS256"],
    });
  }

  async validate(payload: any) {
    const namespace = "https://hr-helper.com";
    const email = payload[`${namespace}/email`];
    const isEmailVerified = payload[`${namespace}/email_verified`];

    if (!email || isEmailVerified !== true) {
      throw new UnauthorizedException(
        "Access denied. Please verify your email address before continuing.",
      );
    }

    return {
      auth0Id: payload.sub,
      email: email,
    };
  }
}
