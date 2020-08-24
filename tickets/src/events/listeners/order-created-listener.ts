import { Listener, OrderCreatedEvent, Subjects } from "@sgtickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // Find ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);
    // throw an error if not found
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    // mark the ticket as reserved by setting the orderid property
    ticket.set({
      orderId: data.id,
    });
    // save ticket
    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      orderId: ticket.orderId,
      userId: ticket.userId,
      version: ticket.version,
    });

    // ack msg
    msg.ack();
  }
}
