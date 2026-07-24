console.log("JavaScript is connected");

const cartNumber = document.querySelector(".nav-cart span");
const savedQuantity =
  Number(localStorage.getItem("rafaajCartQuantity")) || 0;

if (cartNumber) {
  cartNumber.textContent = savedQuantity;
}

// =========================
// MOBILE MENU
// =========================

const menuBtn = document.querySelector(".menu-btn");
const closeBtn = document.querySelector(".close-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && closeBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
}

// =========================
// REVIEWS
// =========================

const reviews = document.querySelectorAll(".review-item");
const loadMoreBtn = document.querySelector("#load-more-reviews");

let visibleReviews = 5;

function showReviews() {
  reviews.forEach((review, index) => {
    review.classList.toggle("review-hidden", index >= visibleReviews);
  });

  if (loadMoreBtn) {
    loadMoreBtn.textContent =
      visibleReviews >= reviews.length
        ? "Hide Reviews"
        : "Load More Reviews";
  }
}

if (loadMoreBtn && reviews.length > 0) {
  loadMoreBtn.addEventListener("click", () => {
    visibleReviews =
      visibleReviews >= reviews.length ? 5 : visibleReviews + 5;

    showReviews();
  });

  showReviews();
}

// =========================
// CART PAGE
// =========================

const cartItem = document.querySelector(".cart-item");
const cartBottom = document.querySelector(".cart-bottom");
const cartPage = document.querySelector(".cart-page");
const removeButton = document.querySelector(".remove");

function showEmptyCart() {
  if (!cartPage) {
    return;
  }

  // Prevent duplicate empty-cart messages.
  if (cartPage.querySelector(".empty-cart-message")) {
    return;
  }

  const emptyCartMessage = document.createElement("div");

  emptyCartMessage.className = "empty-cart-message";
  emptyCartMessage.innerHTML = `
    <i class="fa-solid fa-basket-shopping"></i>
    <h2>Your cart is empty</h2>
    <p>You have no products in your cart.</p>
    <a href="product.html">Continue Shopping</a>
  `;

  cartPage.appendChild(emptyCartMessage);
}

if (savedQuantity === 0 && cartPage) {
  if (cartItem) {
    cartItem.style.display = "none";
  }

  if (cartBottom) {
    cartBottom.style.display = "none";
  }

  showEmptyCart();
}

// =========================
// CART QUANTITY AND PRICES
// =========================

const unitPrice = 24.99;
const shippingPrice = 0;

const quantitySelector = document.querySelector(".quantity-selector");
const productPrice = document.querySelector(".price p");
const summaryRows = document.querySelectorAll(".summary-row");
const totalPrice = document.querySelector(
  ".summary-row.total span:last-child"
);

if (
  quantitySelector &&
  productPrice &&
  summaryRows.length >= 3 &&
  totalPrice &&
  !(cartPage && savedQuantity === 0)
) {
  const cartMinusButton = quantitySelector.querySelector(
    "button:first-of-type"
  );

  const cartPlusButton = quantitySelector.querySelector(
    "button:last-of-type"
  );

  const cartQuantityInput = quantitySelector.querySelector("input");
  const subtotalPrice =
    summaryRows[0].querySelector("span:last-child");
  const shippingPriceEl =
    summaryRows[1].querySelector("span:last-child");

  const DISCOUNT_CODE = "FREESHIP60";
  const FREE_SHIPPING_MIN = 60;
  let discountApplied = false;

  if (
    cartMinusButton &&
    cartPlusButton &&
    cartQuantityInput &&
    subtotalPrice
  ) {
    // Sync the cart page's quantity input to whatever quantity was
    // actually saved (e.g. the user picked 3 on the product page).
    if (savedQuantity > 0) {
      cartQuantityInput.value = savedQuantity;
    }

    function updateCart() {
      let quantity = Number(cartQuantityInput.value);

      if (
        Number.isNaN(quantity) ||
        quantity < 1 ||
        cartQuantityInput.value === ""
      ) {
        quantity = 1;
      }

      quantity = Math.floor(quantity);
      cartQuantityInput.value = quantity;

      const subtotal = unitPrice * quantity;

      // If a discount was applied but the subtotal dropped below the
      // threshold (e.g. quantity was reduced), remove the free shipping.
      if (discountApplied && subtotal < FREE_SHIPPING_MIN) {
        discountApplied = false;

        if (discountMessage) {
          discountMessage.textContent =
            "Free shipping removed — order dropped below £60.";
          discountMessage.style.color = "#b3261e";
        }
      }

      const total = subtotal;

      productPrice.textContent = `£${subtotal.toFixed(2)}`;
      subtotalPrice.textContent = `£${subtotal.toFixed(2)}`;

      if (shippingPriceEl) {
  shippingPriceEl.textContent = "Calculated at checkout";
}

      totalPrice.textContent = `£${total.toFixed(2)}`;

      localStorage.setItem("rafaajCartQuantity", quantity);

      if (cartNumber) {
        cartNumber.textContent = quantity;
      }
    }

    cartPlusButton.addEventListener("click", () => {
      const currentQuantity =
        Number(cartQuantityInput.value) || 1;

      cartQuantityInput.value = currentQuantity + 1;
      updateCart();
    });

    cartMinusButton.addEventListener("click", () => {
      const currentQuantity =
        Number(cartQuantityInput.value) || 1;

      if (currentQuantity > 1) {
        cartQuantityInput.value = currentQuantity - 1;
      }

      updateCart();
    });

    cartQuantityInput.addEventListener("input", updateCart);
    cartQuantityInput.addEventListener("change", updateCart);

    // =========================
    // DISCOUNT CODE
    // =========================

    const discountInput = document.querySelector(".discount-input input");
    const discountButton = document.querySelector(".discount-input button");
    const discountMessage = document.querySelector("#discountMessage");

    if (discountInput && discountButton && discountMessage) {
      discountButton.addEventListener("click", () => {
        const enteredCode = discountInput.value.trim().toUpperCase();
        const quantity = Number(cartQuantityInput.value) || 1;
        const subtotal = unitPrice * quantity;

        if (enteredCode !== DISCOUNT_CODE) {
          discountApplied = false;
          discountMessage.textContent = "Invalid discount code.";
          discountMessage.style.color = "#b3261e";
          updateCart();
          return;
        }

        if (subtotal < FREE_SHIPPING_MIN) {
          discountApplied = false;
          const remaining = (FREE_SHIPPING_MIN - subtotal).toFixed(2);
          discountMessage.textContent = `Spend £${remaining} more to unlock free shipping with this code.`;
          discountMessage.style.color = "#b3261e";
          updateCart();
          return;
        }

        discountApplied = true;
        discountMessage.textContent = "Code applied — free shipping unlocked!";
        discountMessage.style.color = "#2e7d32";
        updateCart();
      });
    }

    updateCart();
  }
}

// =========================
// REMOVE PRODUCT
// =========================

if (removeButton && cartItem && cartPage) {
  removeButton.addEventListener("click", () => {
    cartItem.remove();

    if (cartBottom) {
      cartBottom.remove();
    }

    localStorage.setItem("rafaajCartQuantity", "0");

    if (cartNumber) {
      cartNumber.textContent = "0";
    }

    showEmptyCart();
  });
}

// =========================
// PRODUCT PAGE QUANTITY
// =========================

const addToCartButton =
  document.querySelector(".btn-add-to-cart");

const productQuantityInput =
  document.querySelector(".qty-input");

const quantityButtons =
  document.querySelectorAll(".qty-btn");

if (quantityButtons.length === 2 && productQuantityInput) {
  const productMinusButton = quantityButtons[0];
  const productPlusButton = quantityButtons[1];

  productPlusButton.addEventListener("click", () => {
    const currentQuantity =
      Number(productQuantityInput.value) || 0;

    productQuantityInput.value = currentQuantity + 1;
  });

  productMinusButton.addEventListener("click", () => {
    const currentQuantity =
      Number(productQuantityInput.value) || 0;

    if (currentQuantity > 0) {
      productQuantityInput.value = currentQuantity - 1;
    }
  });
}

if (addToCartButton && productQuantityInput) {
  addToCartButton.addEventListener("click", () => {
    const quantity = Math.max(0, Number(productQuantityInput.value) || 0);

    if (quantity === 0) {
      return;
    }

    localStorage.setItem("rafaajCartQuantity", quantity);

    if (cartNumber) {
      cartNumber.textContent = quantity;
    }
  });
}

// =========================
// FORCE QTY BOX TO 0 (even when the browser restores the page
// from back/forward cache instead of re-running the script)
// =========================

window.addEventListener("pageshow", () => {
  if (productQuantityInput) {
    productQuantityInput.value = 0;
  }
});