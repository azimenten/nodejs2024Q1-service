import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
// import { albumDb } from 'src/db/albums.db';
import { validate } from 'uuid';
// import { trackDb } from 'src/db/tracks.db';
// import { favoriteDb } from 'src/db/favorites.db';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AlbumsService {
  constructor(private readonly prisma: PrismaService) {}
  create(createAlbumDto: CreateAlbumDto) {
    if (!createAlbumDto.name || !createAlbumDto.year) {
      throw new BadRequestException('body does not contain required fields');
    }

    // const newAlbum = {
    //   id: uuidv4(),
    //   name: createAlbumDto.name,
    //   year: createAlbumDto.year,
    //   artistId: createAlbumDto.artistId,
    // };

    // albumDb.addAlbum(newAlbum);
    const newAlbum = this.prisma.album.create({ data: createAlbumDto });
    return newAlbum;
  }

  findAll() {
    return this.prisma.album.findMany();
  }

  findOne(id: string) {
    if (!validate(id)) throw new BadRequestException('Invalid id (not uuid)');
    const album = this.prisma.album.findUnique({ where: { id } });
    if (!album) {
      throw new NotFoundException('Album with such id was not found');
    }
    return album;
  }

  update(id: string, updateAlbumDto: UpdateAlbumDto) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }

    if (!updateAlbumDto.name && !updateAlbumDto.year) {
      throw new BadRequestException('Name or grammy is not defined');
    }

    if (
      typeof updateAlbumDto.name !== 'string' &&
      typeof updateAlbumDto.year !== 'number' &&
      typeof updateAlbumDto.artistId !== 'string'
    ) {
      throw new BadRequestException('Type of name or grammy is not valid');
    }

    const album = this.prisma.album.findUnique({ where: { id } });
    if (!album) {
      throw new NotFoundException('User not found');
    }

    // const updatedAlbum = {
    //   ...album,
    //   name: updateAlbumDto.name,
    //   year: updateAlbumDto.year,
    //   artistId: updateAlbumDto.artistId,
    // };
    // albumDb.updateAlbumById(id, updatedAlbum);
    const updatedAlbum = this.prisma.album.update({
      where: { id },
      data: updateAlbumDto,
    });
    return updatedAlbum;
  }

  remove(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }

    const album = this.prisma.album.findUnique({ where: { id } });
    if (!album) {
      throw new NotFoundException('Album with such id was not found');
    }
    this.prisma.album.delete({ where: { id } });
    this.prisma.track.delete({ where: { id } });
    this.prisma.favorites.update({
      where: { id: '100' },
      data: {
        albums: {
          disconnect: {
            id: id,
          },
        },
      },
    });

    // albumDb.deleteAlbum(id);
    // trackDb.deleteAlbum(id);
    // favoriteDb.deleteAlbumFromFavorites(id);
  }
}
