import express from "express";
import bodyParser from "body-parser";
import axios from "axios";


const app= express();
const port=3000;
const api_url = "http://localhost:4000";

app.use(express.static("public")); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.set("view engine", "ejs");


app.get("/", async (req, res) => {
    try {
      const response = await axios.get(`${api_url}/posts`);
      res.render("index.ejs", { posts: response.data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/new", (req, res) => {
    res.render("modify.ejs", { post: null, action: "/new", button: "Create Post" });
  });
  app.post("/new", async (req, res) => {
    try {
      await axios.post(`${api_url}/posts`, req.body);
      res.redirect("/");
    } catch (error) {
      res.status(500).send("Error creating post");
    }
  });
  app.get("/edit/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const response = await axios.get(`${api_url}/posts/${id}`);
      res.render("modify.ejs", { post: response.data, action: `/edit/${id}`, button: "Update Post" });
    } catch (error) {
      res.status(404).send("Post not found");
    }
  });
  app.post("/edit/:id", async (req, res) => {
    const id = req.params.id;
    try {
      await axios.patch(`${api_url}/posts/${id}`, req.body);
      res.redirect("/");
    } catch (error) {
      res.status(500).send("Error updating post");
    }
  });
  app.post("/delete/:id", async (req, res) => {
    const id = req.params.id;
    try {
      await axios.delete(`${api_url}/posts/${id}`);
      res.redirect("/");
    } catch (error) {
      res.status(500).send("Error deleting post");
    }
  });
          
  app.listen(port, () => {
    console.log(`server running at http://localhost:300`);
  });
    