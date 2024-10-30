import { Controller, Get, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto, LoginUserDto } from './dto';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { RawHeaders, GetUser, Auth } from './decorators';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkStatus(
    @GetUser() user: User
  ) {
    return this.authService.checktatus(user);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    // @Req() request: Express.Request
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    // get user data from token
    // console.log({user: request.user});

    // console.log({user});

    return {
      ok: true,
      message: 'This is a private route',
      user,
      userEmail,
      rawHeaders,
      headers,
    }
  }

  // @SetMetadata('roles', ['admin', 'super-user'])

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      user,
    }
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      user,
    }
  }

}
