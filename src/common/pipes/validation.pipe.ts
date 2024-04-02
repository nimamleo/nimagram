import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Validator } from '../validations/validator';
import { StdResponse } from '../std-response/std-response';

@Injectable()
export class ValidationPipe implements PipeTransform {
  private readonly shouldParse: string[] = [];
  constructor(
    private readonly model: any,
    private readonly types: ('body' | 'query' | 'param' | 'custom')[],
    shouldParse: string[] = [],
    private readonly forWS = false,
  ) {
    this.shouldParse = shouldParse;
  }

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (!this.types.includes(metadata.type)) {
      return value;
    }
    let oldValue = value;
    let ack = null;
    if (this.forWS) {
      oldValue = value.data;
      ack = value.ack;
    }

    const newValue = plainToInstance(this.model, oldValue);
    for (const item of this.shouldParse) {
      try {
        if (newValue[item]) {
          newValue[item] = JSON.parse(newValue[item]);
        }
      } catch (e) {
        delete newValue[item];
      }
    }

    const validationRes = await Validator.validate(newValue);

    if (validationRes.failed()) {
      if (this.forWS && ack) {
        ack(StdResponse.fromResult(validationRes.toResult()));
        return;
      }
      throw new BadRequestException(
        StdResponse.fromResult(validationRes.toResult()),
      );
    }

    if (this.forWS) {
      value.data = newValue;
      return value;
    }

    return newValue;
  }
}
