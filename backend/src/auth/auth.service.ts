import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    // 1. بررسی می‌کنیم ایمیل قبلاً ثبت نشده باشد.
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    // 2. رمز عبور را هش می‌کنیم.
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // 3. کاربر را در دیتابیس ذخیره می‌کنیم.
    const user = await this.usersService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
    });

    // 4. فقط اطلاعات غیرحساس را برمی‌گردانیم.
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
