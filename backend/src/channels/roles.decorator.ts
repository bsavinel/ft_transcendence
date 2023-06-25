import { SetMetadata } from '@nestjs/common';
import { roleChannel } from '@prisma/client';

export const Roles = (...roles: roleChannel[]) => SetMetadata('roles', roles);
