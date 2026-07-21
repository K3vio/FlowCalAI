import { Router } from "express";

import {
  getAllEvents,
  getDisplacedEvents
} from "../data/eventStore.js";

import {
  createEvent
} from "../services/eventService.js";

const router = Router();


// GET current calendar
router.get("/", (_req, res) => {

  res.json({
    status: "success",
    events: getAllEvents()
  });

});


// "+" button submits here
router.post("/", (req, res) => {

  try {

    const result =
      createEvent(req.body);

    if (
      result.status === "conflict"
    ) {

      return res
        .status(409)
        .json(result);

    }

    return res
      .status(201)
      .json(result);

  } catch (error) {

    return res
      .status(400)
      .json({

        status: "error",

        reason:
          "invalid_event_input",

        message:
          error.message

      });

  }

});


// Optional for friend's AI rescheduling
router.get(
  "/displaced",
  (_req, res) => {

    res.json({

      status: "success",

      displaced_events:
        getDisplacedEvents()

    });

  }
);

export default router;
