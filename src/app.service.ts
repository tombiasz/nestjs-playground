import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `${process.env.npm_package_name}@${process.env.npm_package_version}`;
  }
}
