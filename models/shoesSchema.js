import mongoose, { Schema } from "mongoose";

const shoesSchema = new mongoose.Schema(
  {
    shoeImage: { type: String, required: true },
    shoeId: { type: String, required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    priceSale: { type: Number, default: null },
    owner: { type: String, required: true },
    location: { type: String, required: true },
    soldTo: { type: String, default: null },
    soldBy: { type: String, default: null },
    soldAt: { type: String, default: null },
    brand: { type: String, required: true },
    availability: {
      type: String,
      enum: ["available", "sold"],
      default: "available",
    },
    commission: {
      fitz: { type: Number, default: 0 },
      bryan: { type: Number, default: 0 },
      ashley: { type: Number, default: 0 },
      sneakergram: { type: Number, default: 0 },
      sneakfits: { type: Number, default: 0 },
      dateSold: { type: Date, default: null },
      profit: { type: Number, default: null },
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    collection: "shoesInventory", // Name of the collection
  }
);

// Define the model
const Shoes = mongoose.models.Shoes || mongoose.model("Shoes", shoesSchema);

export default Shoes;
