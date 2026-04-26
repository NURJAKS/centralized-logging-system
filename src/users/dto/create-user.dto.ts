import { IsString, IsNumber, IsEmail, Min, Max } from 'class-validator';
export class CreateUserDto {
  @IsString()
  name!: string;
  @IsEmail()
  email!: string;
  @IsNumber()
  @Min(0)
  @Max(150)
  age!: number;
}
