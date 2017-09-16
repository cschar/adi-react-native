import { combineReducers } from 'redux'

const initialState = {
    token: null,
    foop: 'za'
};

const redOne = (state = initialState, action) => {
    switch (action.type) {

        case 'SET_TOKEN':
            console.log("setting token in reducer");

            return {
                ...state,
                token: action.token
            }

        default:
            return state
    }
}



const reducerOne = combineReducers({
    redOne,
})

export default reducerOne