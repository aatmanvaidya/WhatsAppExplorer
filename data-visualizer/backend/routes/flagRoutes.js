const mongoose = require("mongoose");
const express = require("express");

const jwtAuth = require("../lib/jwtAuth");
const Flag = require("../db/Flag");
const Image = require("../db/Image");
const Link = require("../db/Link");
const Message = require("../db/Message");
const Video = require("../db/Video");

const router = express.Router();

// router.get("/", jwtAuth, (req, res) => {
//   Flag.find()
//     .then((content) => {
//       res.json(content);
//     })
//     .catch((err) => {
//       res.status(404).json(err);
//     });
// });

// router.get("/isflagged/:contentId", jwtAuth, (req, res) => {
//   const user = req.user;
//   Flag.find({
//     contentId: mongoose.Types.ObjectId(req.params.contentId),
//     userId: user._id,
//   })
//     .then((content) => {
//       if (content.length > 0) res.json({ isFlagged: true });
//       else res.json({ isFlagged: false });
//     })
//     .catch((err) => {
//       res.status(404).json(err);
//     });
// });

// Check if a message is flagged by the logged-in user
router.post("/isflagged/:contentId", jwtAuth, async (req, res) => {
  const user = req.user;
  const data = req.body;
  const contentId = req.params.contentId;

  const checkFlag = async (obj) => {
    try {
      let message = await obj.findById(mongoose.Types.ObjectId(contentId));
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      // Check if the user has flagged this message
      const flag = message.flags.find((flag) => flag.userId.equals(user._id));

      if (!flag) {
        return res.json({ isFlagged: false, feedback: "" });
      }

      res.json({ isFlagged: true, feedback: flag.feedback });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };

  if (user.type === "admin") {
    switch (data.contentType) {
      case "image":
        checkFlag(Image);
        break;
      case "video":
        checkFlag(Video);
        break;
      case "link":
        checkFlag(Link);
        break;
      case "message":
        checkFlag(Message);
        break;
      default:
        res.status(400).json({
          error: "Incorrect format",
        });
    }
  } else {
    res.status(403).json({
      error: "Unauthorized",
    });
  }
});

// Get all flags
router.post("/:contentId", jwtAuth, async (req, res) => {
  const user = req.user;
  const data = req.body;
  const contentId = req.params.contentId;

  const allFlags = async (obj) => {
    try {
      const message = await obj.findById(mongoose.Types.ObjectId(contentId));
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      // Check if the user has flagged this message
      const flags = message.flags;

      res.json(flags);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };

  // if (user.type === 'admin') {
  switch (data.contentType) {
    case "image":
      allFlags(Image);
      break;
    case "video":
      allFlags(Video);
      break;
    case "link":
      allFlags(Link);
      break;
    case "message":
      allFlags(Message);
      break;
    default:
      res.status(400).json({
        error: "Incorrect format",
      });
  }
  // } else {
  //   res.status(403).json({
  //     error: 'Unauthorized',
  //   });
  // }
});

// router.get("/:contentId", jwtAuth, (req, res) => {
//   Flag.find({ contentId: mongoose.Types.ObjectId(req.params.contentId) })
//     .then((content) => {
//       res.json(content);
//     })
//     .catch((err) => {
//       res.status(404).json(err);
//     });
// });

router.post("/", jwtAuth, async (req, res) => {
  const user = req.user;
  const data = req.body;

  const addFlag = async (obj) => {
    try {
      const message = await obj.findById(mongoose.Types.ObjectId(data.id));
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      // Check if the user has already flagged this message
      const alreadyFlagged = message.flags.some((flag) =>
        flag.userId.equals(user._id),
      );
      if (alreadyFlagged) {
        return res
          .status(400)
          .json({ error: "Message already flagged by this user" });
      }

      // Flag the message
      message.flags.push({ userId: user._id, feedback: data.message });
      await message.save();

      res.json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };

  if (user.type == "admin") {
    switch (data.contentType) {
      case "image":
        addFlag(Image);
        break;
      case "video":
        addFlag(Video);
        break;
      case "link":
        addFlag(Link);
        break;
      case "message":
        addFlag(Message);
        break;
      default:
        res.status(404).json({
          error: "Incorrect format",
        });
    }
  } else {
    res.status(403).json({
      error: "Unauthorised",
    });
  }
});

// Unflag a message
router.delete("/", jwtAuth, async (req, res) => {
  const user = req.user;
  const data = req.body;

  const removeFlag = async (model) => {
    try {
      const message = await model.findById(mongoose.Types.ObjectId(data.id));
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      // Find the flag by the user and remove it
      const flagIndex = message.flags.findIndex((flag) =>
        flag.userId.equals(user._id),
      );
      if (flagIndex === -1) {
        return res
          .status(400)
          .json({ error: "Message is not flagged by this user" });
      }

      message.flags.splice(flagIndex, 1);
      await message.save();

      res.json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };

  if (user.type === "admin") {
    switch (data.contentType) {
      case "image":
        removeFlag(Image);
        break;
      case "video":
        removeFlag(Video);
        break;
      case "link":
        removeFlag(Link);
        break;
      case "message":
        removeFlag(Message);
        break;
      default:
        res.status(400).json({
          error: "Incorrect format",
        });
    }
  } else {
    res.status(403).json({
      error: "Unauthorized",
    });
  }
});

// router.post("/", jwtAuth, (req, res) => {
//   const user = req.user;
//   const data = req.body;

//   let flag = new Flag({
//     contentId: data.id, // <FIX> data.contentId
//     userId: user._id,
//     message: data.message,
//   });

//   const revertSave = (obj) => {
//     obj
//       .delete()
//       .then(() => {
//         res.status(400).json({ error: "Error in saving" });
//       })
//       .catch((err) => {
//         res.status(400).json({ error: err });
//       });
//   };

//   const updateCount = (obj, flagObj, count) => {
//     obj
//       .updateMany(
//         // future fix: refactor table to store flagcount separately or use join
//         // basically extract content id, and flagcount, and join it with the original content
//         {
//           _id: mongoose.Types.ObjectId(data.id),
//         },
//         {
//           $set: {
//             flagCount: count,
//           },
//         }
//       )
//       .then((item) => {
//         console.log(item);
//         if (item === null) {
//           // revert save
//           revertSave(flagObj);
//         } else {
//           res.json({
//             message: "Item flagged successfully",
//           });
//         }
//       })
//       .catch((err) => {
//         // revert save
//         console.log(err);
//         revertSave(flagObj);
//       });
//   };

//   if (user.type == "admin") {
//     flag
//       .save()
//       .then(() => {
//         Flag.count({ contentId: data.id }, (err, count) => {
//           if (err) {
//             // revert save
//             revertSave(flag);
//           } else {
//             switch (data.contentType) {
//               case "image":
//                 updateCount(Image, flag, count);
//                 break;
//               case "link":
//                 updateCount(Link, flag, count);
//                 break;
//               case "message":
//                 updateCount(Message, flag, count);
//                 break;
//               default:
//                 // revert save
//                 revertSave(flag);
//             }
//           }
//         });
//       })
//       .catch((err) => {
//         res.status(400).json(err);
//       });
//   } else {
//     res.status(404).json({
//       error: "unauthorised",
//     });
//   }
// });

// router.delete("/", jwtAuth, (req, res) => {
//   const user = req.user;
//   const data = req.body;

//   const revertSave = (obj) => {
//     obj
//       .save()
//       .then(() => {
//         res.status(400).json({ error: "Error in deleting" });
//       })
//       .catch((err) => {
//         res.status(400).json({ error: err });
//       });
//   };

//   const updateCount = (obj, flagObj, count) => {
//     obj
//       .updateMany(
//         // future fix: refactor table to store flagcount separately or use join
//         // basically extract content id, and flagcount, and join it with the original content
//         {
//           _id: mongoose.Types.ObjectId(data.id),
//         },
//         {
//           $set: {
//             flagCount: count,
//           },
//         }
//       )
//       .then((item) => {
//         console.log(item);
//         if (item === null) {
//           // revert save
//           revertDelete(flagObj);
//         } else {
//           res.json({
//             message: "Item unflagged successfully",
//           });
//         }
//       })
//       .catch((err) => {
//         // revert save
//         revertDelete(flagObj);
//       });
//   };

//   if (user.type == "admin") {
//     Flag.deleteMany({
//       contentId: data.id,
//       userId: user._id,
//     })
//       .then((deletedItem) => {
//         Flag.count({ contentId: data.id }, (err, count) => {
//           if (err) {
//             // revert save
//             revertDelete(deletedItem);
//           } else {
//             switch (data.contentType) {
//               case "image":
//                 updateCount(Image, deletedItem, count);
//                 break;
//               case "link":
//                 updateCount(Link, deletedItem, count);
//                 break;
//               case "message":
//                 updateCount(Message, deletedItem, count);
//                 break;
//               default:
//                 // revert save
//                 revertDelete(deletedItem);
//             }
//           }
//         });
//       })
//       .catch((err) => {
//         res.status(400).json(err);
//       });
//   } else {
//     res.status(404).json({
//       error: "unauthorised",
//     });
//   }
// });

// router.delete("/:contentId", jwtAuth, (req, res) => {
//   const user = req.user;
//   if (user.type == "admin") {
//     Flag.deleteMany({ contentId: req.params.contentId }).then((flag) => {
//       if (flag) {
//         res.json({
//           message: "Content unflagged successfully",
//         });
//       } else {
//         res.status(404).json({
//           error: "Flag not found",
//         });
//       }
//     });
//   } else {
//     res.status(500).json({
//       error: "unauthorised",
//     });
//   }
// });

module.exports = router;
