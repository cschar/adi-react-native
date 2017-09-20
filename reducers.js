import { combineReducers } from 'redux'

const initialState = {
    foop: 'za',
    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo3fQ.RhJF0rumgyu_GfrA41f0PWEtC6LSmFHR9Ke4UDflZG0",
    userInfo: {id: 7, email: 'test@z.ca', points: 12},
    localMarkers: []
};

let localMarkerID = 0;

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

        case 'ADD_MARKER':
            localMarkerID++;
            let marker = {
                    user_id: state.userInfo.id,
                    ltype: 'rock',
                    lat: action.coordinate.latitude,
                    lng: action.coordinate.longitude,
                    id: 'foo'+localMarkerID,
                }
                console.log("adding marker")
                console.log(marker)
                console.log("markers before")
            console.log(state.localMarkers.length)

            return {
                ...state,
                localMarkers: [...state.localMarkers, marker]

            }
        case 'DELETE_MARKER':
            console.log('deleting markers', action.markerId)
            console.log('old length', state.localMarkers.length)

            deleteLocalMarker = (id) => {
                let newMarkers = state.localMarkers;
                let markerToDeleteIndex = null;
                for(let i=0; i < newMarkers.length; i++){
                    let m = newMarkers[i]
                    if( m.id == id){
                        markerToDeleteIndex = i;
                        break;
                    }
                }
                if (markerToDeleteIndex == null){
                    console.log("tried to delete marker but it didnt exist")
                    return {...state}
                }

                newMarkers.splice(markerToDeleteIndex, 1)

                console.log('deleting, new length', newMarkers.length)

                return newMarkers
            }

            let newMarkers = deleteLocalMarker(action.markerId)

            return {
                ...state,
                localMarkers: newMarkers

            }

        default:
            return state
    }
}



const reducerOne = combineReducers({
    redOne,
})

export default reducerOne