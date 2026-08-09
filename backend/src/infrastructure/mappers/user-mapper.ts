import type { User } from "@application/models/user.js";
import {
  LoginResponseSchema,
  type LoginResponseDto as LoginUserResponseDto,
} from "@ticket-system/shared/dto/auth";
import {
  UserSummaryResponseSchema,
  type UserSummaryResponseDto,
} from "@ticket-system/shared";

/**
 * Maps a user domain model to the login response DTO.
 */
export const toLoginUserResponseDto = (user: User): LoginUserResponseDto => {
  return LoginResponseSchema.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

/**
 * Maps a user domain model to the shared summary DTO.
 */
export const toUserSummaryResponseDto = (
  user: User,
): UserSummaryResponseDto => {
  return UserSummaryResponseSchema.parse({
    id: user.id,
    name: user.name,
  });
};
