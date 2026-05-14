## V Secretum - A Secure Password Manager App

V Secretum is a open-source, modern and secure password manager app designed to keep your credentials protected while providing a clean and simple user experience. The application uses advanced AES encryption to securely store passwords in encrypted form within the database ensuring credentials are not stored as plain text. Encryption keys are dynamically generated using user specific identifiers which are unique for every user, adding an additional layer of security for every account.

The app includes seamless Google Sign-In authentication, fast password search, category-based filtering, and an intuitive UI for effortless password management. Users can organize credentials into sections like Social, Work, Important, and Other, making access quick and efficient without compromising security.

### Features include:

- AES encrypted password storage
- Dynamic user based encryption mechanism
- Google Sign-In authentication
- Fast password search
- Smart filtering & categorization
- Minimal and user friendly interface
- Organized vault for socials, work, important accounts, and more
- Open-source frontend and backend architecture

### Backend Repo Link : [V Secretum Backend](https://github.com/vrushabhgawas14/V-Secretum-backend)

### App Download Link : [Download](https://github.com/vrushabhgawas14/V-secretum/releases/tag/1.0)

#### Setup steps

- npx create-expo-app@latest v-secretum --template blank-typescript
- npx expo install expo-dev-client
- npx expo prebuild
- configure app.config.js (with projectID from expo.dev/your-account) also `scheme: "v-secretum",`
- configure eas.json
- npx expo-doctor
- npx expo prebuild --no-install --platform android
- `npx expo prebuild -p android` -(creates android folder and gives correct dev network ip)
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

- **Install Google Sign in**

  ```
  npm i @react-native-google-signin/google-signin
  ```

- **KeyTool for Local SHA1 fingerprint - Not Needed though**

  ```
  keytool -keystore .\android\app\debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
  ```

- **Eas Credentials run in terminal**

  ```
  eas credentials -p android
  ```

- **Let server start in lan network address**

  ```
  npx expo start --lan
  ```
