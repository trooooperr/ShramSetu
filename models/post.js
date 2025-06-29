const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    date:
    {
        type:Date,
        default:Date.now
    },
    name: String,
    mobile : String,
    job: String,
    description : String,
    estimate_budget : Number,
    latitude:Number,
    longitude:Number,
    formattedAddress:String,
    work_done :
    {
        type:String,
        default:"Pending"
    },
    pictures :[
        {
            type:String
        }
    ]
})

module.exports = mongoose.model('post',postSchema);