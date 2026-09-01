import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../redux/cartSlice'
import authReducer from '../redux/authSlice'
import faqReducer from '../redux/faqSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    faq: faqReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
