import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {

  @ApiProperty({
    required: false,
    type: Number,
    description: 'The limit of items to get',
    default: 10
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // The same as enableImplicitConversion: true
  limit?: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: 'The offset of items to get',
    default: 0
  })
  @IsOptional()
  @IsPositive()
  @Min(0)
  @Type(() => Number) // The same as enableImplicitConversion: true
  offset?: number;

}