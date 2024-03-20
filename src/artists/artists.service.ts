import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
// import { artistDb } from 'src/db/artists.db';
import { validate } from 'uuid';
// import { albumDb } from 'src/db/albums.db';
// import { trackDb } from 'src/db/tracks.db';
// import { favoriteDb } from 'src/db/favorites.db';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createArtistDto: CreateArtistDto) {
    if (!createArtistDto.name || !createArtistDto.grammy) {
      throw new BadRequestException('body does not contain required fields');
    }

    // const newArtist = {
    //   id: uuidv4(),
    //   name: createArtistDto.name,
    //   grammy: createArtistDto.grammy,
    // };

    // artistDb.addArtist(newArtist);
    const newArtist = this.prisma.artist.create({ data: createArtistDto });
    return newArtist;
  }

  findAll() {
    return this.prisma.artist.findMany();
  }

  findOne(id: string) {
    if (!validate(id)) throw new BadRequestException('Invalid id (not uuid)');
    const artist = this.prisma.artist.findUnique({ where: { id } });
    if (!artist) {
      throw new NotFoundException('Artist with such id was not found');
    }
    return artist;
  }

  update(id: string, updateArtistDto: UpdateArtistDto) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }

    if (!updateArtistDto.name && !updateArtistDto.grammy) {
      throw new BadRequestException('Name or grammy is not defined');
    }

    if (
      typeof updateArtistDto.name !== 'string' &&
      typeof updateArtistDto.grammy !== 'boolean'
    ) {
      throw new BadRequestException('Type of name or grammy is not valid');
    }

    const artist = this.prisma.artist.findUnique({ where: { id } });
    if (!artist) {
      throw new NotFoundException('Artist is not found');
    }

    // const updatedArtist = {
    //   ...artist,
    //   name: updateArtistDto.name,
    //   grammy: updateArtistDto.grammy,
    // };
    // artistDb.updateArtistById(id, updatedArtist);
    const updatedArtist = this.prisma.artist.update({
      where: { id },
      data: updateArtistDto,
    });
    return updatedArtist;
  }

  remove(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }
    const artist = this.prisma.artist.findUnique({ where: { id } });
    if (!artist) {
      throw new NotFoundException('Artist with such id was not found');
    }
    // artistDb.deleteArtist(id);
    // albumDb.deleteArtist(id);
    // trackDb.deleteArtist(id);
    // favoriteDb.deleteArtistFromFavorites(id);
    this.prisma.artist.delete({ where: { id } });
    this.prisma.album.deleteMany({ where: { artistId: id } });
    this.prisma.track.deleteMany({ where: { artistId: id } });
    this.prisma.favorites.update({
      where: { id: '100' },
      data: {
        artists: {
          disconnect: {
            id: id,
          },
        },
      },
    });
  }
}
