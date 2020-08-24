import { TicketUpdatedEvent } from "@sgtickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setUp = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 100,
  });

  await ticket.save();

  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "Concert-11",
    price: 200,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };
  return { listener, data, ticket, message };
};

it("Updates a ticket", async () => {
  const { listener, data, message, ticket } = await setUp();
  await listener.onMessage(data, message);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket?.price).toEqual(data.price);
  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.version).toEqual(data.version);
});

it("acks a message", async () => {
  const { listener, data, message } = await setUp();
  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});

it("it should not call ack if the event has a skipped version number", async () => {
  const { listener, data, message } = await setUp();
  data.version = 10;

  try {
    await listener.onMessage(data, message);
  } catch (error) {}

  expect(message.ack).not.toHaveBeenCalled();
});
