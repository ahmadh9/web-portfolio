const posts = require("../models/postsModel");

exports.showAllPosts = (req, res) => {
  const all = posts.getAll();
  res.render("index", { posts: all });
};

exports.showForm = (req, res) => {
  res.render("modify", { post: null, action: "/posts", button: "Create" });
};

exports.create = (req, res) => {
  posts.add(req.body);
  res.redirect("/posts");
};

exports.showEditForm = (req, res) => {
  const post = posts.getById(req.params.id);
  if (!post) return res.status(404).send("Post not found");
  res.render("modify", {
    post,
    action: `/posts/${post.id}`,
    button: "Update",
  });
};

exports.update = (req, res) => {
  posts.update(req.params.id, req.body);
  res.redirect("/posts");
};

exports.remove = (req, res) => {
  posts.delete(req.params.id);
  res.redirect("/posts");
};
