import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

const creatTickets = () => {
  const title = "Title-test";
  const price = 20;

  return request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);
};
it("Should fetch a list of tickets", async () => {
  await creatTickets();
  await creatTickets();
  await creatTickets();

  const response = await request(app).get("/api/tickets").send();
  expect(response.body.length).toEqual(3);
});
