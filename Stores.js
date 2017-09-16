
// import axios from 'axios';
import { observable, autorun } from 'mobx';
import { Alert } from 'react-native';

// const API_URL: string = 'https://api.spotify.com/v1/search';
import { createStore } from 'redux'
import reducer from './reducers.js'


// let store = null;
//
// global.storage.load({
//     key: 'userInfo',
// }).then(ret => {
//     persistedState = ret;
//     store = createStore(
//         reducer,
//         persistedState
//     )
// }).catch(err => {
//     console.warn(err.message);
// })

const store = createStore(
    reducer,
)

export default store



// export default class SearchStore {
class SearchStore {
    @observable query = 'zaquery';
    @observable token = 'defaultToken';
    @observable tracks = [];

    get query() {
        return this.query;
    }

    set token(token) {
        console.log("SET TOKEN================")
        return this.token
    }

    set query(artist) {
        this.query = artist;
    }

    get tracks() {
        return this.tracks;
    }


}



const SearchStore2 = observable({
    /* some observable state */
    token: 'farboo',
    query: 'habba',
    query2: 'habba',

    /* a derived value */
    get fancyToken() {
        return this.token + '[]]';
    }
});

/* a function that observes the state */
autorun(function() {
    console.log("Completed %s of %s items %s",
        SearchStore.token,
        SearchStore2.token,
        SearchStore2.query,
        SearchStore2.query2

    );
});

SearchStore2.token = 'NEW-TOken'
//export default searchStore2


