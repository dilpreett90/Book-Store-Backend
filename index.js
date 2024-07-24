const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// MongoDB configuration
const uri = "mongodb+srv://mernbookstore:UboqkaB6C46JDPvS@bookstore.foixkms.mongodb.net/?appName=BookStore";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Create a collection of documents
    const bookcollections = client.db("BookInventory").collection("books");

    // Insert book to collection
    app.post("/upload-book", async (req, res) => {
      const data = req.body;
      const result = await bookcollections.insertOne(data);
      res.send(result);
    });

    // Get all books
    app.get("/all-books", async (req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category };
      }
      const result = await bookcollections.find(query).toArray();
      res.send(result);
    });

    // Update a book
    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      console.log(`Updating book with id: ${id}`);
      try {
        const updateBookData = req.body;
        const filter = { _id: new ObjectId(id) }; // Convert id to ObjectId
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            ...updateBookData
          }
        };

        const result = await bookcollections.updateOne(filter, updateDoc, options);
        res.send(result);
      } catch (error) {
        console.error('Error updating book:', error);
        res.status(400).send('Invalid ID format');
      }
    });

    // Delete a book data
    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      console.log(`Deleting book with id: ${id}`);
      try {
        const filter = { _id: new ObjectId(id) }; // Convert id to ObjectId
        const result = await bookcollections.deleteOne(filter);
        res.send(result);
      } catch (error) {
        console.error('Error deleting book:', error);
        res.status(400).send('Invalid ID format');
      }
    });

    // Get data of a single book
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      console.log(`Fetching book with id: ${id}, type: ${typeof id}`);
      try {
        const filter = { _id: new ObjectId(id) }; 
        const book = await bookcollections.findOne(filter);

        if (!book) {
          return res.status(404).send('Book not found');
        }

        res.json(book);
      } catch (error) {
        console.error('Error fetching book:', error);
        res.status(400).send('Invalid ID format');
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    
  }
}
run().catch(console.dir);

// Start the server
app.listen(port, () => {
  console.log(`Server started at: ${port}`);
});
