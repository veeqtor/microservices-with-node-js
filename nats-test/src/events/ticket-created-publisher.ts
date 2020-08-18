import { ITicketCreatedEvent } from "./ticket-created-listener";
import Publisher from "./base-publisher";
import { Subjects } from "./subjects";

class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}

export default TicketCreatedPublisher;
