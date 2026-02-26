export default {
  expo: {
    // Use the env var from eas.json, fallback to a default
    name: process.env.APP_NAME || "V Secretum",
    slug: "v-secretum",
    scheme: "v-secretum",
    version: "1.0.0",
    orientation: "portrait",
    icon: process.env.APP_ICON || "./assets/vonly.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/vsec.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier:
        process.env.ANDROID_PACKAGE || "com.vrushabhgawas.v_secretum", // iOS equivalent
      deploymentTarget: "13.0",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: process.env.APP_ICON || "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      // Use the env var from eas.json
      package: process.env.ANDROID_PACKAGE || "com.vrushabhgawas.v_secretum",
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      "expo-secure-store",
      "expo-local-authentication",
      "@react-native-google-signin/google-signin",
    ],
    extra: {
      eas: {
        projectId: "69423ef1-c258-4817-8673-73b0611918bc",
      },
    },
  },
};
