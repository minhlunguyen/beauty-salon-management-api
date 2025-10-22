import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Auth0AuthGuard extends AuthGuard('auth0') {}
