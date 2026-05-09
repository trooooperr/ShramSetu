const mongoose= require('mongoose');

const workerSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    intro: { type: String },
    pincode: { type: String, required: true },
    job: { type: String },
    yearsExperience: {type: String},
    minimumpay: { type: Number },
    doNotDisturbStart: { type: String },
    doNotDisturbEnd: { type: String },
    ifsc: { type: String },
    BankAccountNo: { type: String },
    profilepic: {
        type: String,
        default: "default.png"
    },
    identity: { type: String }
});


module.exports = mongoose.model('worker',workerSchema);