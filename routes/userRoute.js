const User = require("../models/user");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const { q, start, limit } = req.query;
  if (!q) {
    //if not have a query => will get all users
    const userList = await User.find()
      .skip(start)
      .limit(limit)
      .sort({ userId: 1 })
      .then(
        (responses) => {
          if (responses.length < 1) {
            res.send("No Data");
          } else {
            res.send(responses);
          }
        },
        (error) => {
          res.send("Something went Wrong");
        }
      );
  }
  if (q) {
    //if url have a query => will do this
    const regex = new RegExp("^" + q, "i"); //don't matter with lettercase
    await User.find({
      $or: [{ name: regex }, { email: regex }],
    })
      .skip(start)
      .limit(limit)
      .sort({ userId: 1 })
      .then(
        (responses) => {
          if (responses.length < 1) {
            res.send("No Data");
          } else {
            res.send(responses);
          }
        },
        (error) => {
          res.send("Something went Wrong");
        }
      );
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  await User.findOne({ userId: userId })
    .sort({ userId: 1 })
    .then(
      (responses) => {
        if (responses) {
          res.send(responses);
        } else {
          res.send(`userId:${userId} does not exist`);
        }
      },
      (error) => {
        res.send("Something went Wrong");
      }
    );
});

router.post("/", async (req, res) => {
  const { name, age, email, avatarUrl } = req.body;
  const ageRegex = /^\d+$/;
  if (!ageRegex.test(age)) {
    return res.send({ error: "Age must be integer" }); // email does not match the pattern
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) {
    return res.send({ error: "Invalid email address" }); // email does not match the pattern
  }

  let user = new User({
    name: name,
    age: age,
    email: email,
    avatarUrl: avatarUrl,
  });
  await user.save().then(
    (responses) => {
      res.send(responses);
    },
    (error) => {
      res.send(error.errors.email.message);
    }
  );
});

router.post("/insertmockdata", (req, res) => {
  const data = req.body;

  User.create(data, (error, result) => {
    if (error) {
      res.send(error);
    } else {
      res.send("complete");
    }
  });
});

router.put("/:userId", (req, res) => {
  const { userId } = req.params;
  const { name, age, email, avatarUrl } = req.body; //req body
  const ageRegex = /^\d+$/;
  if (!ageRegex.test(age)) {
    return res.send({ error: "Age must be integer" }); // email does not match the pattern
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) {
    return res.send({ error: "Invalid email address" }); // email does not match the pattern
  }

  User.findOne({ userId: userId }, function (err, doc) {
    if (err) {
      return res.send(error);
    }
    if (doc.email === email) {
      // email has not changed, update the document
      User.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            name: name,
            age: age,
            email: email,
            avatarUrl: avatarUrl,
          },
        },
        {
          new: true,
        }
      )
        .then(function (doc) {
          res.send(doc);
        })
        .catch(function (error) {
          res.send(error);
        });
    } else {
      // email has changed, check for uniqueness
      User.findOne({ email: email }, function (err, doc) {
        if (doc) {
          return res.send("Email is already in use"); // email is not unique
        }

        // email is unique, update the document
        User.findOneAndUpdate(
          { userId: userId },
          {
            $set: {
              name: name,
              age: age,
              email: email,
              avatarUrl: avatarUrl,
            },
          },
          {
            new: true,
          }
        )
          .then(function (doc) {
            res.send(doc);
          })
          .catch(function (error) {
            res.send(error);
          });
      });
    }
  });
});

router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;
  await User.findOneAndRemove({ userId: userId }).then(
    (responses) => {
      if (responses) {
        res.send(`userId:${userId} is deleted successfully`);
      } else {
        res.send(`userId:${userId} does not exist`);
      }
    },
    (error) => {
      res.send("Something went Wrong");
    }
  );
});

module.exports = router;
