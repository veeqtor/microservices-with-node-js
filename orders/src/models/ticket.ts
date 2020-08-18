import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";

interface ITicket {
  title: string;
  price: number;
}

export interface ITicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

interface ITicketModel extends mongoose.Model<ITicketDoc> {
  build(attrs: ITicket): ITicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.statics.build = (attrs: ITicket) => new Ticket(attrs);
ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!existingOrder;
};
const Ticket = mongoose.model<ITicketDoc, ITicketModel>("Ticket", ticketSchema);

export { Ticket };
