import type { User } from "@application/models/user.js";
import type { LoginUserResponseDto } from "@infrastructure/validation/user-schemas.js";

export const toLoginUserResponseDto = (user: User): LoginUserResponseDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});
