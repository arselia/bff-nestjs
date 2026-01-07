import {
    ClassSerializerInterceptor,
    PlainLiteralObject,
    StreamableFile,
  } from '@nestjs/common';
  import { ClassTransformOptions, plainToInstance } from 'class-transformer';
  import { isArray, isNil, isObject } from 'lodash';
  import { Document } from 'mongoose';
  
  function MongooseClassSerializerInterceptor(
    classToIntercept: any,
  ): typeof ClassSerializerInterceptor {
    return class Interceptor extends ClassSerializerInterceptor {
      private changePlainObjectToClass(document: PlainLiteralObject) {
        if (!(document instanceof Document)) {
          return document;
        }
  
        return plainToInstance(classToIntercept, document.toJSON(), {
          excludeExtraneousValues: true,
        });
      }
  
      private prepareResponse(
        response: PlainLiteralObject | PlainLiteralObject[],
      ) {
        if (isArray(response)) {
          return response.map(this.changePlainObjectToClass);
        }
  
        return this.changePlainObjectToClass(response);
      }
  
      serialize(
        response: PlainLiteralObject | PlainLiteralObject[],
        options: ClassTransformOptions,
      ): PlainLiteralObject | PlainLiteralObject[] {
        if (isNil(response) || response instanceof StreamableFile) {
          return response;
        }
  
        if (!isObject(response)) {
          return response;
        }
  
        return this.prepareResponse(response);
      }
    };
  }
  
  export default MongooseClassSerializerInterceptor;
  
  
