import { PartialType } from "@nestjs/swagger";
import { CreateReadlistDto } from "./create-readlist.dto";

export class UpdateReadlistDto extends PartialType(CreateReadlistDto) {}