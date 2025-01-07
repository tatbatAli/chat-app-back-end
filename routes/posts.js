import express from "express";

const router = express.Router();

let posts = [
  { id: 1, title: "first" },
  { id: 2, title: "second" },
  { id: 3, title: "third" },
];

router.get("/", (req, res, next) => {
  const limit = parseInt(req.query.limit);
  if (!isNaN(limit) && limit > 0) {
    return res.json(posts.slice(0, limit));
  }

  res.json(posts);
});

// GET method

router.get("/:id", (req, res, next) => {
  const id = parseInt(req.params.id);
  const filterPost = posts.find((post) => post.id === id);
  if (!filterPost) {
    const err = new Error("No Post Found");
    err.status = 404;
    return next(err);
  }
  res.status(200).json(filterPost);
});

//POST methode

router.post("/", (req, res, next) => {
  const newPost = {
    id: posts.length + 1,
    title: req.body.title,
  };

  if (!newPost.title) {
    const err = new Error("No Post Found");
    err.status = 400;
    return next(err);
  }

  posts.push(newPost);
  res.status(201).json(posts);
});

//PUT method

router.put("/:id", (req, res, next) => {
  const id = parseInt(req.params.id);
  const post = posts.find((post) => post.id === id);
  if (!post) {
    const err = new Error("No Post Found");
    err.status = 404;
    return next(err);
  }
  post.title = req.body.title;
  post.id = parseInt(req.body.id);
  res.status(200).json(posts);
});

// DELETE method

router.delete("/:id", (req, res, next) => {
  const id = parseInt(req.params.id);
  const filterPost = posts.filter((post) => post.id !== id);
  const findPost = posts.find((post) => post.id === id);

  if (!findPost) {
    const err = new Error("No Post Found");
    err.status = 404;
    return next(err);
  }

  posts = filterPost;

  res.status(200).json(posts);
});

export default router;
