import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../../models/order";
import { ExpirationCompleteEvent } from "@sgtickets/common";
import { Message } from "node-nats-streaming";

const setUp = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 100,
  });

  await ticket.save();
  const order = Order.build({
    status: OrderStatus.Created,
    userId: "12344",
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, order, ticket, msg };
};

it("Update the order status to cancelled", async () => {
  const { listener, data, order, msg } = await setUp();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("Emit ordercancelled event", async () => {
  const { listener, data, order, msg } = await setUp();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it("Ack the messgae", async () => {
  const { listener, data, msg } = await setUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
