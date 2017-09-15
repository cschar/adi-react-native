# Expo React Native Prototype for adi app

### notes

integrating apollo w/ react
http://dev.apollodata.com/react/simple-example.html

apollo network status here:
https://github.com/apollographql/apollo-client/blob/master/packages/apollo-client/src/core/networkStatus.ts


## running

At root of project
```
cat > config.js
const config = {
    ADI_GRAPHQL_SERVER: 'https://servername/graphqlendpoint'
}
export default config;
```