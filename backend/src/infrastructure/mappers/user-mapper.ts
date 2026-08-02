import type { User } from "@application/models/user.js";
import {
  LoginResponseSchema,
  type LoginResponseDto as LoginUserResponseDto,
} from "@ticket-system/shared/dto/auth";

export const toLoginUserResponseDto = (user: User): LoginUserResponseDto => {
  return LoginResponseSchema.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};
