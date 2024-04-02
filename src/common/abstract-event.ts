export abstract class AbstractEvent<T> {
  constructor(protected readonly data: T) {}

  abstract getEventName(): string;

  getData(): T {
    return this.data;
  }
}
