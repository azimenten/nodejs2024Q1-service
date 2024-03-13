import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { albumDb } from 'src/db/albums.db';
import { artistDb } from 'src/db/artists.db';
import { favoriteDb } from 'src/db/favorites.db';
import { trackDb } from 'src/db/tracks.db';
import { validate } from 'uuid';

@Injectable()
export class FavoritesService {
  findAll() {
    return favoriteDb.getFavorites();
  }

  addTrack(id: string) {
    if (!validate(id)) throw new BadRequestException('Invalid id (not uuid)');
    const track = trackDb.getTrackById(id);
    if (!track) {
      throw new UnprocessableEntityException(
        'Track with such id was not found',
      );
    }

    favoriteDb.addTrackToFavorites(track);
    return track;
  }

  removeTrack(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }
    const track = favoriteDb.getTrackFromFavorites(id);

    if (!track) {
      throw new NotFoundException('Track with such id was not found');
    }

    favoriteDb.deleteTrackFromFavorites(id);
  }

  addAlbum(id: string) {
    if (!validate(id)) throw new BadRequestException('Invalid id (not uuid)');
    const album = albumDb.getAlbumById(id);
    if (!album) {
      throw new UnprocessableEntityException(
        'Album with such id was not found',
      );
    }

    favoriteDb.addAlbumToFavorites(album);
    return album;
  }

  removeAlbum(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }
    const album = favoriteDb.getAlbumFromFavorites(id);
    if (!album) {
      throw new NotFoundException('Album with such id was not found');
    }
    favoriteDb.deleteAlbumFromFavorites(id);
  }

  addArtist(id: string) {
    if (!validate(id)) throw new BadRequestException('Invalid id (not uuid)');
    const artist = artistDb.getArtistById(id);
    if (!artist) {
      throw new UnprocessableEntityException(
        'Artist with such id was not found',
      );
    }

    favoriteDb.addArtistToFavorites(artist);
    return artist;
  }

  removeArtist(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }
    const artist = favoriteDb.getArtistFromFavorites(id);
    if (!artist) {
      throw new NotFoundException('Artist with such id was not found');
    }
    favoriteDb.deleteArtistFromFavorites(id);
  }
}
