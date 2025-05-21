const express = require("express");
const path = require("path");
const app = express();
const postsRoutes = require("./src/routes/postsRoutes");

require("dotenv").config();

// إعدادات Express
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views")); // لأنك حاط views برا src
app.set("view engine", "ejs");

// المسارات
app.use("/posts", postsRoutes);

// تحويل المسار الأساسي إلى صفحة البوستات
app.get("/", (req, res) => {
  res.redirect("/posts");
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
