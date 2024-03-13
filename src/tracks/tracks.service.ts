import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { v4 as uuidv4, validate } from 'uuid';
import { trackDb } from 'src/db/tracks.db';
import { favoriteDb } from 'src/db/favorites.db';

@Injectable()
export class TracksService {
  create(createTrackDto: CreateTrackDto) {
    if (!createTrackDto.name || !createTrackDto.duration) {
      throw new BadRequestException('body does not contain required fields');
    }

    const newTrack = {
      id: uuidv4(),
      name: createTrackDto.name,
      artistId: createTrackDto.artistId,
      albumId: createTrackDto.albumId,
      duration: createTrackDto.duration,
    };

    trackDb.addTrack(newTrack);
    return newTrack;
  }

  findAll() {
    return trackDb.getTracks();
  }

  findOne(id: string) {
    if (!validate(id)) throw new BadRequestException('Invalid id (not uuid)');
    const track = trackDb.getTrackById(id);
    if (!track) {
      throw new NotFoundException('Artist with such id was not found');
    }
    return track;
  }

  update(id: string, updateTrackDto: UpdateTrackDto) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }

    if (!updateTrackDto.name && !updateTrackDto.duration) {
      throw new BadRequestException('Name or duration is not defined');
    }

    if (
      typeof updateTrackDto.name !== 'string' &&
      typeof updateTrackDto.duration !== 'number'
    ) {
      throw new BadRequestException('Type of name or duraton is not valid');
    }

    const track = trackDb.getTrackById(id);
    if (!track) {
      throw new NotFoundException('Track is not found');
    }

    const updatedTrack = {
      ...track,
      name: updateTrackDto.name,
      duration: updateTrackDto.duration,
    };

    trackDb.updateTrackById(id, updatedTrack);
    return updatedTrack;
  }

  remove(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }
    const track = trackDb.getTrackById(id);
    if (!track) {
      throw new NotFoundException('Artist with such id was not found');
    }
    trackDb.deleteTrack(id);
    favoriteDb.deleteTrackFromFavorites(id);
  }
}
