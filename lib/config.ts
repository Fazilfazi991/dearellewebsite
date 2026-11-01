// Owner-confirmed values only. Null means the channel is intentionally unavailable.
export const launchConfig = {
  contactEmail: null,
  whatsappNumber: "918086191325",
  instagramUrl: null,
  shippingPolicy: "Delivery across India. No delivery charge.",
  returnPolicy:
    "Contact us for damage during delivery. An unpacking video helps document damage; it does not limit your statutory consumer rights.",
  liveCommerceEnabled: true,
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
    "Contact us for damage during delivery. An unpacking video helps document damage; it does not limit your statutory consumer rights.",
} as const;
