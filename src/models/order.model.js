const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      trim: true,
      require: true,
    },
    charges: {
      tax: {
        type: Number,
        default: 0,
      },
      taxName: String,
      additionalCharge: {
        name: { type: String, trim: true },
        percentage: { type: Number },
        amount: { type: Number, default: 0 },
      },
      parcelCharge: { type: Number, default: 0 },
      taxIncludeItemTotalPrice: { type: Number, default: 0 },
      serviceCharge: { type: Number, default: 0 },
      appliedDiscount: {
        type: Number,
        default: 0,
      },
    },
    orderStatus: {
      type: String,
      trim: true,
      enum: ['open', 'completed'],
      default: 'open',
    },
    storeId: {
      type: mongoose.Types.ObjectId,
      ref: 'store',
    },
    storeName: {
      type: String,
      trim: true,
    },
    paymentDetails: {
      status: { type: String, trim: true },
      paymentType: { type: String, trim: true },
    },
    tableNo: {
      type: String,
      trim: true,
      required: true,
    },
    tableId: {
      type: mongoose.Types.ObjectId,
      ref: 'table',
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: 'customer',
    },
    customerName: String,
    subtotalBillAmount: {
      type: Number,
    },
    finalBillAmount: {
      type: Number,
    },
    grossAmount: {
      type: Number,
    },
    roundoffAmount: {
      type: Number,
    },
    isBillPrinted: {
      type: Boolean,
      default: false,
    },
    currency: {
      type: String,
      trim: true,
    },
    subOrders: [
      {
        orderType: {
          type: String,
          trim: true,
          enum: ['dining', 'take_away', 'preorder'],
        },
        isSelfOrder: Boolean,
        waiterId: {
          type: mongoose.Types.ObjectId,
          ref: 'user',
        },
        waiterName: {
          type: String,
          trim: true,
        },
        kotNumber: {
          type: String,
          trim: true,
        },
        totalAddonsAmount: {
          type: Number,
        },
        totalMenuitemsAmount: {
          type: Number,
        },
        totalAppliedDiscount: {
          type: Number,
        },
        subordersTotalPrice: {
          type: Number,
        },
        orderStatus: {
          type: String,
          trim: true,
          enum: ['open', 'verified', 'accepted', 'completed'],
          default: 'open',
        },
        isKotPrinted: {
          type: Boolean,
          default: false,
        },
        createdAt: Date,
        addons: [
          {
            addonId: { type: mongoose.Schema.Types.ObjectId, ref: 'AddOn' },
            name: {
              type: String,
              trim: true,
            },
            quantity: {
              type: Number,
              default: 1,
            },
            note: {
              type: String,
              trim: true,
            },
            finalPrice: Number,
            basePrice: Number,

            variant: {
              variantName: String,
              price: Number,
            },
          },
        ],
        orderItems: [
          {
            itemStatus: {
              type: String,
              trim: true,
              enum: ['open', 'preparing', 'readytoserve', 'delivered'],
              default: 'open',
            },
            name: {
              type: String,
              trim: true,
            },
            isVeg: {
              type: Boolean,
            },
            itemId: {
              type: mongoose.Types.ObjectId,
              ref: 'menuitem',
            },
            quantity: {
              type: Number,
              default: 1,
            },
            kitchen: {
              type: mongoose.Types.ObjectId,
              ref: 'kitchens',
            },
            kitchenName: {
              type: String,
              trim: true,
            },
            note: {
              type: String,
              trim: true,
            },
            variant: {
              variantName: String,
              price: Number,
            },
            itemTotalDiscount: Number,
            finalPrice: Number,
            basePrice: Number,
            offerPrice: Number,
            categoryDetails: {
              category: { type: String, trim: true },
            },
          },
        ],
      },
    ],
  },

  { timestamps: true }
);

OrderSchema.plugin(toJSON);
OrderSchema.plugin(paginate);
OrderSchema.index({ storeId: 1, customerId: 1 });

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
