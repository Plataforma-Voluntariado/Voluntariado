import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { VoluntarioService } from './voluntario.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('voluntario')
export class VoluntarioController {
    constructor(private readonly voluntarioService: VoluntarioService) { }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.voluntarioService.findById(id);
    }
}
