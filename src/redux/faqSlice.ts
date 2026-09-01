import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FaqState {
  currentFaqId: string;
}

const initialState: FaqState = {
  currentFaqId: '',
};

const faqSlice = createSlice({
  name: 'faq',
  initialState,
  reducers: {
    setFaqId: (state, action: PayloadAction<string>) => {
      state.currentFaqId = action.payload;
    },
    resetFaq: (state) => {
      state.currentFaqId = '';
    },
  },
});

export const { setFaqId, resetFaq } = faqSlice.actions;
export default faqSlice.reducer;
