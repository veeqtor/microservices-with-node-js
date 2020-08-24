import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@sgtickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setUp = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client);
  const data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: "Concert",
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };
  return { listener, data, message };
};

it("Creates and save a ticket", async () => {
  const { listener, data, message } = await setUp();
  await listener.onMessage(data, message);

  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket?.price).toEqual(data.price);
  expect(ticket?.title).toEqual(data.title);
});

it("acks a message", async () => {
  const { listener, data, message } = await setUp();
  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
