import mongoose from "mongoose";

interface IPaymentAttrs {
  orderId: string;
  stripeId: string;
}

interface IPaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

interface IPaymentModel extends mongoose.Model<IPaymentDoc> {
  build(attrs: IPaymentAttrs): IPaymentDoc;
}

const PaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },

    stripeId: {
      type: String,
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

PaymentSchema.statics.build = (attrs: IPaymentAttrs) => new Payment(attrs);

const Payment = mongoose.model<IPaymentDoc, IPaymentModel>(
  "Payment",
  PaymentSchema
);

export { Payment };
