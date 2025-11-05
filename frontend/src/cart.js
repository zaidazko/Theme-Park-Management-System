// Compatibility shim — cart functionality now lives in the Cart component module.
// Re-export the named helpers from the components Cart file so older imports
// (`import { addItem } from "../cart"`) continue to work.
import CartComponent, { getCart, addItem, removeFromCart, clearCart } from "./components/Cart";

export { getCart, addItem, removeFromCart, clearCart };
export default { getCart, addItem, removeFromCart, clearCart, CartComponent };
