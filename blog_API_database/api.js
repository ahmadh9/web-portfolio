import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
const app =express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

 const db = new pg.Client({
user: "postgres",
host: "localhost",
database: "blog",
password: "root",
port: 5432,




 });
 db.connect().then(()=>{
console.log('dtabase connected Succefuly!')
}).catch(()=>{});

  app.get("/posts", async (req,res)=>{

    try{const result =await db.query("SELECT * FROM posts ORDER BY id");
        res.json(result.rows);

} catch(error){
    res.status(500).json({ error: error.message});
}

 

  });

app.post("/posts",async (req,res)=>{
    const { title,content,author } = req.body;
    console.log(req.body);
        try{
            const result = await db.query("INSERT INTO posts(title,content,author) VALUES($1,$2,$3) RETURNING *",
                [title,content,author]
            );
        res.status(201).json(result.rows[0])
        } 

        catch(error){
                res.status(500).json({ error: error.message});

        }
});

app.put("/posts/:id", async(req,res)=>{
const id = parseInt(req.params.id);
const { title,content,author}=req.body;

try{
const result  = await db.query(
    "UPDATE posts SET  title = $1, content=$2, author=$3, date =NOW() WHERE id = $4 Returning *",
    [title,content,author,id]
); if (result.length.rows>0){
    res.status(200).json(result.rows[0]);
} else { res.status(404).json({ error: `post id ${id} not found`});
}

} catch (error){                res.status(500).json({ error: error.message});
}



});

app.get("/posts/:id", async(req, res)=> {
    const id  = parseInt(req.params.id);
        try{const result =await db.query("SELECT * FROM posts WHERE id = $1",[id]);
            if (result.rows.length >0)  res.json(result.rows[0]);
            else res.status(404).json({ error: "post not found"});
       

} catch(error){
    res.status(500).json({ error: error.message});
}

   
});


app.patch("/posts/:id",async (req,res)=>{
const id = parseInt(req.params.id);
const { title,content,author}=req.body;

try{
    const fields = [];
    const VALUES=[];
    let count = 1;
if(title){
    fields.push(`title = $${count++}`);
    VALUES.push(title);
}
if(content){
    fields.push(`content = $${count++}`);
    VALUES.push(content);
}
if(author){
    fields.push(`author = $${count++}`);
    VALUES.push(author);
}
VALUES.push(id);

const result  = await db.query(
    `UPDATE posts SET ${fields.join( ",")}, date =NOW() WHERE id = $${count} RETURNING *`,
   VALUES
); if (result.rows.length>0){
    res.status(200).json(result.rows[0]);
} else { res.status(404).json({ error: `post id ${id} not found`});
}

} catch (error){                res.status(500).json({ error: error.message});
}



});
app.delete("/posts/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await db.query("DELETE FROM posts WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length > 0) {
      res.sendStatus(200); 
    } else {
      res.status(404).json({ error: `Post with ID ${id} not found` });
    }

  } catch (error) {
          res.status(500).json({ error: error.message });
  }
});



  app.listen(4000, () => {
    console.log("API Server running on http://localhost:4000");
  });
  
  