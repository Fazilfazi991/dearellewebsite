// Owner-confirmed values only. Null means the channel is intentionally unavailable.
export const launchConfig = {
  contactEmail: null,
  whatsappNumber: null,
  instagramUrl: null,
  shippingPolicy: "Delivery across India. No delivery charge.",
  returnPolicy:
    "Returns for damage during delivery. An unpacking video is required.",
  liveCommerceEnabled: false,
} as const;

// Owner confirmed 31 October 2026. Deposit is part of, not added to, the total.
export const commercePolicy = {
  country: "India",
  shippingRegions: "All India",
  shippingCharge: 0,
  paymentMethod: "COD",
  advanceDeposit: 50,
  currency: "INR",
  dispatchRequiresContact: true,
  dispatchRequiresVerifiedAdvance: true,
  returns:
    "Returns for damage during delivery. Please record an unpacking video.",
} as const;
