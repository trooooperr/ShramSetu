const mongoose= require('mongoose');

const workerSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    intro: { type: String },
    pincode: { type: Number, required: true },
    job: { type: String },
    minimumpay: { type: Number },
    doNotDisturbStart: { type: String },
    doNotDisturbEnd: { type: String },
    ifsc: { type: String },
    BankAccountNo: { type: String },
    profilepic: {
        type: String,
        default: "default.png"
    }
});
  

module.exports = mongoose.model('worker',workerSchema);