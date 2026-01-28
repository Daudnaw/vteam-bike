import { Schema, model } from "mongoose";

const positionSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const schema = new Schema(
  {
    scooterId: {
      type: Schema.Types.ObjectId,
      ref: "Scooter",
      required: true,
      unique: true,
      index: true,
    },

    lat: { type: Number, required: true, default: 0 },
    lng: { type: Number, required: true, default: 0 },

    history: { type: [positionSchema], default: [] },
  },
  { timestamps: true }
);

schema.options.toJSON = {
  transform: (_, ret) => {
    ret._id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
};

const Location = model("Location", schema);
export default Location;