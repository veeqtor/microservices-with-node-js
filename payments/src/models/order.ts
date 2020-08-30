import mongoose from "mongoose";
import { OrderStatus } from "@sgtickets/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
export { OrderStatus };

interface IOrderAttrs {
  id: string;
  userId: string;
  status: OrderStatus;
  price: number;
  version: number;
}

interface IOrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  price: number;
  version: number;
}

interface IOrderModel extends mongoose.Model<IOrderDoc> {
  build(attrs: IOrderAttrs): IOrderDoc;
}

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
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

OrderSchema.set("versionKey", "version");
OrderSchema.plugin(updateIfCurrentPlugin);
OrderSchema.statics.build = (attrs: IOrderAttrs) =>
  new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status,
  });
const Order = mongoose.model<IOrderDoc, IOrderModel>("Order", OrderSchema);

export { Order };
