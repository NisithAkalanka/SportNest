const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  // දැනට, සරලව තියාගන්න, අපි user කෙනෙක්ට එක cart එකයි කියල හිතමු.
  // දියුණු කරනවා නම්, මෙතනට user ID එකක් දාන්න පුළුවන්.
  //
  // cart එකේ තියෙන items list එක
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item', // 'Item' model එකට සම්බන්ධයි
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1, // අඩුම තරමේ එකක්වත් තියෙන්න ඕන
        default: 1
      }
    }
  ],
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', CartSchema);