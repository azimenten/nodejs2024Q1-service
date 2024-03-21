import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { albumDb } from 'src/db/albums.db';
import { artistDb } from 'src/db/artists.db';
import { favoriteDb } from 'src/db/favorites.db';
// import { trackDb } from 'src/db/tracks.db';
import { validate } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const res1 = await this.prisma.favorites.findFirst({
      select: {
        artists: {
          select: {
            id: true,
            name: true,
            grammy: true,
          },
        },
        tracks: {
          select: {
            id: true,
            duration: true,
            name: true,
            artistId: true,
            albumId: true,
          },
        },
        albums: {
          select: { id: true, name: true, artistId: true, year: true },
        },
      },
    });
    const res2 = await this.prisma.favorites.findFirst({
      select: {
        artists: true,
        tracks: true,
        albums: true,
      },
    });
    const res3 = await this.prisma.favorites.findFirst();
    console.log('res1', res1);
    console.log('res2', res2);
    console.log('res3', res3);
    return;
  }

  async addTrack(id: string) {
    if (!validate(id)) throw new BadRequestException('Invalid id (not uuid)');
    const track = await this.prisma.track.findFirst({ where: { id } });
    if (!track) {
      throw new UnprocessableEntityException(
        'Track with such id was not found',
      );
    }

    let favorites = await this.prisma.favorites.findFirst();
    if (!favorites) {
      favorites = await this.prisma.favorites.create({
        data: {
          tracks: { connect: { id } },
        },
      });
    }
    const updatedFavorites = await this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        tracks: {
          connect: { id },
        },
      },
    });
    console.log(updatedFavorites);
    return track;
  }

  async removeTrack(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }
    const track = await this.prisma.favorites.findFirst({ where: { id } });

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
