import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

// ProductCard displays individual product info and handles cart actions and navigation
const ProductCard = ({ product }) => {
  // Get currency format, cart manipulators, current cart items, and navigation helper from context
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();

  // Only render when product data is available
  return (
    product && (
      // Outer container: navigate to product detail on click
      <div
        onClick={() => {
          navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
          scrollTo(0, 0); // Scroll to top after navigation
        }}
        className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white w-full h-full flex flex-col justify-between"
      >
        {/* Image section: scales image on hover */}
        <div className="group cursor-pointer flex items-center justify-center px-2">
          <img
            className="group-hover:scale-105 transition max-w-26 md:max-w-36"
            src={product.image[0]}
            alt={product.name}
            crossOrigin="anonymous"
          />
        </div>

        {/* Product details: category, name, rating, price, and cart controls */}
        <div className="text-gray-500/60 text-sm">
          {/* Category label */}
          <p>{product.category}</p>

          {/* Product name: truncated if too long */}
          <p className="text-gray-700 font-medium text-lg truncate w-full">
            {product.name}
          </p>

          {/* Rating stars: show 4 filled stars and 1 dull star */}
          <div className="flex items-center gap-0.5">
            {Array(5)                // Create array of length 5
              .fill("")            // Fill with dummy values
              .map((_, i) => (      // Loop over each index i
                <img
                  key={i}           // Unique key for each element
                  className="md:w-3.5 w3"
                  src={               // Choose star icon based on index
                    i < 4 
                      ? assets.star_icon      // Filled star for indices 0-3
                      : assets.star_dull_icon // Dull star for index 4
                  }
                  alt={i < 4 ? "filled star" : "empty star"}
                />
              ))}
            <p>(4)</p>     {/* Numeric rating display */}
          </div>

          {/* Price and cart section */}
          <div className="flex items-end justify-between mt-3">
            {/* Display offer price prominently with original price struck through */}
            <p className="md:text-xl text-base font-medium text-primary">
              {currency}{product.offerPrice}{" "}
              <span className="text-gray-500/60 md:text-sm text-xs line-through">
                {currency}{product.price}
              </span>
            </p>

            {/* Add-to-cart or quantity controls */}
            <div
              onClick={(e) => e.stopPropagation()} // Prevent navigating away when clicking controls
              className="text-primary"
            >
              {!cartItems[product._id] ? (    // If item not in cart
                <button
                  className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded cursor-pointer"
                  onClick={() => addToCart(product._id)}
                >
                  <img src={assets.cart_icon} alt="cart icon" />
                  Add
                </button>
              ) : (                         // If item already in cart, show quantity adjustment
                <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/25 rounded select-none">
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="cursor-pointer text-md px-2 h-full"
                  >
                    -
                  </button>
                  <span className="w-5 text-center">
                    {cartItems[product._id]}
                  </span>
                  <button
                    onClick={() => addToCart(product._id)}
                    className="cursor-pointer text-md px-2 h-full"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ProductCard;
