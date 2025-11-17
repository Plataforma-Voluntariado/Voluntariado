import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voluntario } from './entity/voluntario.entity';

@Injectable()
export class VoluntarioService {
	constructor(
		@InjectRepository(Voluntario)
		private voluntarioRepo: Repository<Voluntario>,
	) {}

	async findById(id: number): Promise<Voluntario> {
		const voluntario = await this.voluntarioRepo.findOne({
			where: { id_usuario: id },
			relations: ['usuario', 'estadisticas'],
		});

		if (!voluntario) {
			throw new NotFoundException('Voluntario no encontrado');
		}

		return voluntario;
	}
}
