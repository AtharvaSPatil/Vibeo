import mongoose, {mongo, Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // the subscriber
        ref: "User",
    },
    channel: {
        type: Schema.Types.ObjectId, // the subscribed channel
        ref: "User",
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema) 
