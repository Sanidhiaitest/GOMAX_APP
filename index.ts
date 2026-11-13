import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';

// Must be called outside any React component — required for Android background push.
// The system shows the notification automatically; nothing else needed here.
messaging().setBackgroundMessageHandler(async () => undefined);

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
