const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const server = express();

const Friend = require("./FriendModel.js");
const Post = require("./PostModel.js");

server.use(bodyParser.json());
server.use(cors());
server.use(helmet());

server.get("/", function(req, res) {
  res.status(200).json({ status: "The API is awake!" });
});

server.post("/friends", (req, res) => {
  const friendInfo = req.body;
  const { firstName, lastName, age } = friendInfo;
  const friend = new Friend(friendInfo);
  if (firstName && lastName && age) {
    if (typeof age !== "number" || age < 1 || age > 120) {
      res
        .status(400)
        .json({ errorMessage: "Age must be a whole number between 1 and 120" });
    } else {
      friend
        .save()
        .then(savedFriend => {
          res.status(201).json(savedFriend);
        })
        .catch(error => {
          res.status(400).json({
            errorMessage: "There was an error saving the friend to the database"
          });
        });
    }
  } else {
    res.status(400).json({
      errorMessage: "Please provide a firstName, lastName and age for friend."
    });
  }
});

server.post("/posts", (req, res) => {
  const blogPost = req.body;
  const { postTitle, postContent } = blogPost;
  const post = new Post(blogPost);
  if (postTitle && postContent) {
    post
      .save()
      .then(savedPost => {
        res.status(201).json(savedPost);
      })
      .catch(error => {
        res.status(500).json({
          errorMessage: "There was an error saving the post to the database"
        });
      });
  } else {
    res.status(404).json({
      errorMessage: "Please provide a post title and some content"
    });
  }
});

server.get("/friends", (req, res) => {
  Friend.find()
    .then(friends => {
      res.status(200).json(friends);
    })
    .catch(error => {
      res
        .status(500)
        .json({ errorMessage: "The information could not be retrieved" });
    });
});

server.get("/posts", (req, res) => {
    Post.find()
      .then(posts => {
        res.status(200).json(posts);
      })
      .catch(error => {
        res
          .status(500)
          .json({ errorMessage: "The Post list could not be retrieved" });
      });
  });

server.get("/friends/:id", (req, res) => {
  const { id } = req.params;
  Friend.findById(id)
    .then(friend => {
      if (friend) {
        res.status(200).json(friend);
      } else {
        res.status(404).json({
          errormessage: "The friend with the specified ID does not exist"
        });
      }
    })
    .catch(error => {
      res
        .status(500)
        .json({ errorMessage: `The information could not be retrieved` });
    });
});

server.get("/posts/:id", (req, res) => {
    const { id } = req.params;
    Post.findById(id)
      .then(post => {
        if (post) {
          res.status(200).json(post);
        } else {
          res.status(404).json({
            errormessage: "The post with the specified ID does not exist"
          });
        }
      })
      .catch(error => {
        res
          .status(500)
          .json({ errorMessage: `The Post information could not be retrieved` });
      });
  });

server.delete("/friends/:id", (req, res) => {
  const { id } = req.params;
  Friend.findByIdAndRemove(id)
    .then(friend => {
      if (friend) {
        res.status(201).json({ message: "Friend has been deleted" });
      } else {
        res.status(404).json({
          errorMessage: "The friend with the specified id does not exist"
        });
      }
    })
    .catch(error => {
      res.status(500).json({ errorMessage: `The friend could not be removed` });
    });
});

server.delete("/posts/:id", (req, res) => {
    const { id } = req.params;
    Post.findByIdAndRemove(id)
      .then(post => {
        if (post) {
          res.status(201).json({ message: "Post has been deleted" });
        } else {
          res.status(404).json({
            errorMessage: "The Post with the specified id does not exist"
          });
        }
      })
      .catch(error => {
        res.status(500).json({ errorMessage: `The Post could not be removed` });
      });
  });

server.put("/friends/:id", (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, age } = req.body;
  if (firstName && lastName && age) {
    Friend.findByIdAndUpdate(id, req.body)
      .then(updatedFriend => {
        if (updatedFriend) {
          res.status(201).json(updatedFriend);
        } else {
          res
            .status(404)
            .json({ errorMessage: `No friend with the id ${id} exists` });
        }
      })
      .catch(error => {
        res.status(500).json({
          errorMessage: "There has been an error updating this Friend"
        });
      });
  } else {
    res.status(500).json({
      errorMessage: "Please provide a first name, last name, and age"
    });
  }
});

server.put("/posts/:id", (req, res) => {
    const { id } = req.params;
    const { postTitle, postContent } = req.body;
    if (postTitle && postContent) {
      Post.findByIdAndUpdate(id, req.body)
        .then(updatedPost => {
          if (updatedPost) {
            res.status(201).json(updatedPost);
          } else {
            res
              .status(404)
              .json({ errorMessage: `No Post with the id ${id} exists` });
          }
        })
        .catch(error => {
          res.status(500).json({
            errorMessage: "There has been an error updating this Post"
          });
        });
    } else {
      res.status(500).json({
        errorMessage: "Please provide Post Title and Content"
      });
    }
  });

mongoose
  .connect("mongodb://localhost/FriendList")
  .then(db => {
    console.log(
      `Successfully connected to the ${db.connections[0].name} database`
    );
  })
  .catch(error => {
    console.log(`Database Connection Failed`);
  });

const port = process.env.PORT || 5005;
server.listen(port, () => {
  console.log(`API running on http://localhost:${port}.`);
});
