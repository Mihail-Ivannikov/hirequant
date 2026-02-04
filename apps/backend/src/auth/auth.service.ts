import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async syncUser(user: { auth0Id: string; email: string }) {
    const existingByAuth0 = await this.prisma.user.findUnique({
      where: { auth0Id: user.auth0Id },
    });

    if (existingByAuth0) return existingByAuth0;

    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingByEmail) {
      if (existingByEmail.auth0Id && existingByEmail.auth0Id !== user.auth0Id) {
        throw new ConflictException(
          "This email is already linked to another account.",
        );
      }

      return this.prisma.user.update({
        where: { id: existingByEmail.id },
        data: { auth0Id: user.auth0Id },
      });
    }

    return this.prisma.user.create({
      data: {
        email: user.email,
        auth0Id: user.auth0Id,
        role: "CANDIDATE",
      },
    });
  }
}
