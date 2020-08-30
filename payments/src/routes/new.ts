import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
} from "@sgtickets/common";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { natsWrapper } from "../nats-wrapper";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").not().isEmpty().withMessage("Token is required"),
    body("orderId").not().isEmpty().withMessage("Order ID is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }
    console.log(order);

    if (
      order.status === OrderStatus.Cancelled ||
      order.status === OrderStatus.Complete
    ) {
      throw new BadRequestError("Cannot pay for a cancelled order");
    }

    const charge = await stripe.charges.create({
      amount: order.price * 100, // convert to cents
      currency: "usd",
      source: token,
      description: `Charge created for order ${order.id}`,
    });

    const payment = Payment.build({
      stripeId: charge.id,
      orderId,
    });
    await payment.save();
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId,
      stripeId: charge.id,
    });

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
