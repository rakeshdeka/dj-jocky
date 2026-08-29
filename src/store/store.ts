import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../redux/cartSlice'
import authReducer from '../redux/authSlice'
// import faqSlice from '../redux/faqSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer
    
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
