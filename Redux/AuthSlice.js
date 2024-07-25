import { createSlice,createAsyncThunk } from "@reduxjs/toolkit"

const initialState ={
    userData:null,
    isLoading :false,
    isSuccess: false,
    isError :false
}

export const login = createAsyncThunk('login',(params)=>{})
const authSlice = createSlice({
    name :"AuthSlice",
    initialState,
    reducers:{},
    extraReducers :{}
})
export default authSlice.reducer