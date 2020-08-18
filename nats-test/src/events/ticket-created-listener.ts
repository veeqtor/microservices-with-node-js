import Listener from "./base-listener";
import { Message } from "node-nats-streaming";
import { Subjects } from "./subjects";

export interface ITicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}

class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: ITicketCreatedEvent["data"], msg: Message) {
    console.log("Event Data:", data);
    msg.ack();
  }
}

export default TicketCreatedListener;
