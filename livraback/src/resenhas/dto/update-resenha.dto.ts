import { PartialType } from "@nestjs/mapped-types";
import { CreateResenhaDto } from "./create-resenha.dto";

export class UpdateResenhaDto extends PartialType(CreateResenhaDto) {}