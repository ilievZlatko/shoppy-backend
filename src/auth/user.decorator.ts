import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Token } from './token.interface';

const getCurrentUserByContext = (context: ExecutionContext): Token | null => {
  return context.switchToHttp().getRequest().user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
