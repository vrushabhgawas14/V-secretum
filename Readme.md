## V Secretum

#### Setup steps

- npx create-expo-app@latest v-secretum --template blank-typescript
- npx expo install expo-dev-client
- npx expo prebuild
- configure app.config.js (with projectID from expo.dev/your-account) also `scheme: "v-secretum",`
- configure eas.json
- npx expo-doctor
- npx expo prebuild --no-install --platform android
- eas build -p android --profile development
- `npx expo start` OR `npm start`
- eas build -p android --profile preview

#### Converting to File Based Routing

- ````
    npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar ```
  ````
- Update `package.json`: Set `"main": "expo-router/entry"`
- In app.config.js
  ````
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro"
  },
  plugins: [
    "expo-router"
  ],```
  ````
- make folder structure : `src` -> `app, components, services, constants, store, types`

- **Files in Subfolder :** `app` -> `_layout.tsx`, `index.tsx`

- make file `babel.config.js`
  ```
  module.exports = function (api) {
      api.cache(true);
      return {
          presets: ['babel-preset-expo'],
          plugins: ['expo-router/babel'],
      };
  };
  ```

#### Required for App

- `Zustand` conflict error : Resolve using ->

  ```
  npm install zustand --legacy-peer-deps
  ```

- **Google Auth :**

  ```
  npx expo install expo-auth-session expo-crypto expo-web-browser
  ```

- **Secure local storage (for PIN, encryption key) :**

  ```
  npm install expo-secure-store --legacy-peer-deps
  ```

- **Local biometric/PIN auth :**

  ```
  npx expo install expo-local-authentication
  ```

- **Encryption :**

  ```
  npm install crypto-js
  npm install --save-dev @types/crypto-js
  ```

- **Axios :**

  ```
  npm install axios
  ```

- **UI :**
  ```
  npm install @rneui/themed @rneui/base react-native-vector-icons
  ```
