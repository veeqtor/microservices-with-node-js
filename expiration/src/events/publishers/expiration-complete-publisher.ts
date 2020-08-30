import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@sgtickets/common";

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
}
