// Cart badla (add / remove) -> Header ka cart count refresh ho
export const CART_UPDATED_EVENT = "kridemy:cart-updated";

export const notifyCartUpdated = () => {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
};
