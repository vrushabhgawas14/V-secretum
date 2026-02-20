## V Secretum

#### Setup steps
- npx create-expo-app@latest v-secretum --template blank-typescript
- npx expo install expo-dev-client
- npx expo prebuild
- configure app.config.js (with projectID from expo.dev/your-account)
- configure eas.json
- npx expo-doctor
- npx expo prebuild --no-install --platform android
- eas build -p android --profile development
- `npx expo start` OR `npm start`
- eas build -p android --profile preview