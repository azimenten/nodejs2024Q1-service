import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { albumDb } from 'src/db/albums.db';
import { v4 as uuidv4, validate } from 'uuid';
import { trackDb } from 'src/db/tracks.db';
import { favoriteDb } from 'src/db/favorites.db';

@Injectable()
export class AlbumsService {
  create(createAlbumDto: CreateAlbumDto) {
    if (!createAlbumDto.name || !createAlbumDto.year) {
      throw new BadRequestException('body does not contain required fields');
    }

    const newAlbum = {
      id: uuidv4(),
      name: createAlbumDto.name,
      year: createAlbumDto.year,
      artistId: createAlbumDto.artistId,
    };

    albumDb.addAlbum(newAlbum);
    return newAlbum;
  }

  findAll() {
    return albumDb.getAlbums();
  }

  findOne(id: string) {
    if (!validate(id)) throw new BadRequestException('Invalid id (not uuid)');
    const album = albumDb.getAlbumById(id);
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

    const album = albumDb.getAlbumById(id);
    if (!album) {
      throw new NotFoundException('User not found');
    }

    const updatedAlbum = {
      ...album,
      name: updateAlbumDto.name,
      year: updateAlbumDto.year,
      artistId: updateAlbumDto.artistId,
    };
    albumDb.updateAlbumById(id, updatedAlbum);
    return updatedAlbum;
  }

  remove(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }

    const album = albumDb.getAlbumById(id);
    if (!album) {
      throw new NotFoundException('Album with such id was not found');
    }

    albumDb.deleteAlbum(id);
    trackDb.deleteAlbum(id);
    favoriteDb.deleteAlbumFromFavorites(id);
  }
}
