const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;
const MONGO_URL = "mongodb://127.0.0.1:27017/carter";

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

const connectionSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ["customer", "supplier", "neighbour"],
    required: true,
  },
  state: {
    type: String,
    trim: true,
  },
  companyCode: {
    type: String,
    trim: true,
  },
  feedback: {
    type: Number,
    min: 1,
    max: 5,
  },
  commodity: {
    type: String,
    trim: true,
  },
  machineModel: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Connection = mongoose.model("Connection", connectionSchema);

function validateRequiredFields(body, isUpdate = false) {
  const requiredFields = ["businessName", "phone", "category"];
  const missingFields = [];

  for (const field of requiredFields) {
    const value = body[field];
    const isMissing =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "");

    if (!isUpdate && isMissing) {
      missingFields.push(field);
    }

    if (isUpdate && Object.prototype.hasOwnProperty.call(body, field) && isMissing) {
      missingFields.push(field);
    }
  }

  return missingFields;
}

function getErrorStatus(error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return 400;
  }
  return 500;
}

app.post("/connection", async (req, res) => {
  try {
    const missingFields = validateRequiredFields(req.body);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    const connection = await Connection.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Connection created successfully",
      data: connection,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 400 ? "Validation failed" : "Failed to create connection",
      error: error.message,
    });
  }
});

app.get("/connections", async (req, res) => {
  try {
    const { category, state, search, sort, page = "1", limit = "10" } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (state) {
      filter.state = state;
    }

    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Number.parseInt(page, 10);
    const limitNumber = Number.parseInt(limit, 10);

    if (
      Number.isNaN(pageNumber) ||
      Number.isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination values. 'page' and 'limit' must be positive integers.",
      });
    }

    let sortOption = { createdAt: -1 };
    if (sort === "name") {
      sortOption = { businessName: 1 };
    } else if (sort && sort !== "latest") {
      return res.status(400).json({
        success: false,
        message: "Invalid sort value. Use 'latest' or 'name'.",
      });
    }

    const skip = (pageNumber - 1) * limitNumber;
    const total = await Connection.countDocuments(filter);

    const connections = await Connection.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(total / limitNumber);

    return res.status(200).json({
      success: true,
      count: connections.length,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
      data: connections,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching connections",
      error: error.message,
    });
  }
});

app.put("/connection/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const missingFields = validateRequiredFields(req.body, true);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Required field(s) cannot be empty: ${missingFields.join(", ")}`,
      });
    }

    const updatedConnection = await Connection.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedConnection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Connection updated successfully",
      data: updatedConnection,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 400 ? "Validation failed" : "Failed to update connection",
      error: error.message,
    });
  }
});

app.delete("/connection/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedConnection = await Connection.findByIdAndDelete(id);

    if (!deletedConnection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Connection deleted successfully",
      data: deletedConnection,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 400 ? "Invalid connection id" : "Failed to delete connection",
      error: error.message,
    });
  }
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URL);
    app.listen(PORT, () => {
      console.log("Server running on port 5000");
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();

/*
Sample API tests (PowerShell):

POST /connection
Invoke-RestMethod -Uri "http://127.0.0.1:5000/connection" -Method Post -ContentType "application/json" -Body '{"businessName":"Acme Pvt Ltd","phone":"9876543210","category":"customer","state":"CA"}'

GET /connections with filters
Invoke-RestMethod -Uri "http://127.0.0.1:5000/connections?category=customer&state=CA" -Method Get

GET /connections with search
Invoke-RestMethod -Uri "http://127.0.0.1:5000/connections?search=acme" -Method Get

GET /connections with pagination and sort
Invoke-RestMethod -Uri "http://127.0.0.1:5000/connections?page=1&limit=5&sort=name" -Method Get

PUT /connection/:id
Invoke-RestMethod -Uri "http://127.0.0.1:5000/connection/<id>" -Method Put -ContentType "application/json" -Body '{"state":"NY","feedback":5}'

DELETE /connection/:id
Invoke-RestMethod -Uri "http://127.0.0.1:5000/connection/<id>" -Method Delete
*/
