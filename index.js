const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const multer = require("multer");
const Event = require("./models/event");
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Multer configuration: memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Root send index.html from public:
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Upload the image to imgbb and return the URL:
const uploadImage = async (image) => {
  const formData = new FormData();
  const imageData = Buffer.from(image.data, "binary");
  const base64ImageData = imageData.toString("base64");
  formData.append("image", base64ImageData);
  formData.append("key", process.env.IMGBB_API_KEY);

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (data.status !== 200) {
    throw new Error(
      "Something went wrong with image upload. Please try again."
    );
  }
  return data.data.url;
};

// Create an event which accepts multipart form data with multiple images:
app.post("/event", upload.any(), async (req, res) => {
  try {
    const images = req.files.map((file) => {
      return {
        data: file.buffer,
        name: file.originalname,
        contentType: file.mimetype,
      };
    });

    const {
      title,
      club,
      description,
      team_size,
      min_team_size,
      rounds,
      registration_limit,
      whatsapp_group,
    } = req.body;

    const eventExists = await Event.findOne({ title });

    if (eventExists) {
      return res.status(400).json({ message: "Event already exists" });
    }

    let event_coordinators = JSON.parse(req.body.event_coordinators);
    let rules = JSON.parse(req.body.rules);

    event_coordinators = await Promise.all(
      event_coordinators.map(async (coordinator, index) => {
        coordinator.image = await uploadImage(images[index]);

        return coordinator;
      })
    );

    const event = new Event({
      title,
      club,
      description,
      team_size,
      min_team_size,
      rounds,
      registration_limit,
      whatsapp_group,
      rules,
      event_coordinators,
    });

    await event.save();

    res.status(201).json({ message: "Event created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000: http://localhost:3000");
});
