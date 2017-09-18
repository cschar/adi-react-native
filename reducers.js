import { combineReducers } from 'redux'

const initialState = {
    token: '',
    foop: 'za',
    userId: null,
    points: null,
    userInfo: {},
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
                    id: '-1',
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

            deleteLocalMarker = (id) => {
                let newMarkers = state.localMarkers;
                let markerToDeleteIndex = null;
                for(let i=0; i < newMarkers.length; i++){
                    let m = newMarkers[i]
                    if( m.key == id){
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