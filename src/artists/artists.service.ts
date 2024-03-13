import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { artistDb } from 'src/db/artists.db';
import { v4 as uuidv4, validate } from 'uuid';
import { albumDb } from 'src/db/albums.db';
import { trackDb } from 'src/db/tracks.db';
import { favoriteDb } from 'src/db/favorites.db';

@Injectable()
export class ArtistsService {
  create(createArtistDto: CreateArtistDto) {
    if (!createArtistDto.name || !createArtistDto.grammy) {
      throw new BadRequestException('body does not contain required fields');
    }

    const newArtist = {
      id: uuidv4(),
      name: createArtistDto.name,
      grammy: createArtistDto.grammy,
    };

    artistDb.addArtist(newArtist);
    return newArtist;
  }

  findAll() {
    return artistDb.getArtists();
  }

  findOne(id: string) {
    if (!validate(id)) throw new BadRequestException('Invalid id (not uuid)');
    const artist = artistDb.getArtistById(id);
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

    const artist = artistDb.getArtistById(id);
    if (!artist) {
      throw new NotFoundException('Artist is not found');
    }

    const updatedArtist = {
      ...artist,
      name: updateArtistDto.name,
      grammy: updateArtistDto.grammy,
    };
    artistDb.updateArtistById(id, updatedArtist);
    return updatedArtist;
  }

  remove(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }
    const artist = artistDb.getArtistById(id);
    if (!artist) {
      throw new NotFoundException('Artist with such id was not found');
    }

    artistDb.deleteArtist(id);
    albumDb.deleteArtist(id);
    trackDb.deleteArtist(id);
    favoriteDb.deleteArtistFromFavorites(id);
  }
}
