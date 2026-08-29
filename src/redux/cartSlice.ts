import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../lib/cart-api';

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((item) => item.service_id === action.payload.service_id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
    },
    updateQuantity: (state, action: PayloadAction<{ service_id: string; quantity: number }>) => {
      const item = state.items.find((entry) => entry.service_id === action.payload.service_id);
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.service_id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { setCart, addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
