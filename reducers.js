import { combineReducers } from 'redux'

const initialState = {
    token: null,
    foop: 'za',
    userId: null,
    points: null,
    userInfo: {}
};

const redOne = (state = initialState, action) => {
    switch (action.type) {

        case 'SET_TOKEN':
            console.log("setting token in reducer");

            return {
                ...state,
                token: action.token
            }
        case 'SET_USER_INFO':
            return {
                ...state,
                token: action.token,
                userInfo: action.userInfo
            }

        default:
            return state
    }
}



const reducerOne = combineReducers({
    redOne,
})

export default reducerOne