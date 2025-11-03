"use client";
import React from "react";

const OrderDetails = ({ cart, removeFromCart, clearCart }) => {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.07; // Example 7% tax
  const total = subtotal + tax;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>
      <div className="flex justify-between mb-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
          Dine In
        </button>
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
          Take Away
        </button>
      </div>
      {cart.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No Order</p>
          <p>Tap the product to add into order</p>
        </div>
      ) : (
        <div>
          {cart.map((item) => (
            <div
              key={item.product._id}
              className="flex justify-between items-center mb-2"
            >
              <div>
                <p className="font-bold">{item.product.name}</p>
                <p className="text-sm text-gray-500">
                  x{item.quantity} ${item.product.price.toFixed(2)}
                </p>
              </div>
              <p>${(item.product.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeFromCart(item.product._id)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={clearCart}
            className="w-full bg-red-500 text-white py-2 rounded-lg mt-4"
          >
            Clear All Order
          </button>
        </div>
      )}
      <div className="mt-4">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>${subtotal.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p>Tax</p>
          <p>${tax.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p>Voucher</p>
          <p>$0.00</p>
        </div>
        <div className="flex justify-between font-bold text-xl mt-2">
          <p>Total</p>
          <p>${total.toFixed(2)}</p>
        </div>
      </div>
      <button className="w-full bg-green-600 text-white py-3 rounded-lg mt-4">
        Process Transaction
      </button>
    </div>
  );
};

export default OrderDetails;
