importScripts('swenv.js');
importScripts("https://www.gstatic.com/firebasejs/8.2.10/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.10/firebase-messaging.js");
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGESENDERID,
};
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function (payload) {
  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        windowClient.postMessage(payload);
      }
    })
    .then(() => {
      return registration.showNotification("In-app notifications");
    });
  return promiseChain;
});
messaging.onBackgroundMessage((payload) => {
  console.log(payload)
  const { data } = payload
  console.log(`Received msg in messaging.onBackgroundMessage`)
  // Customize notification here
  const notificationTitle = data.title;
  const notificationOptions = {
    body: `${data?.message_1} | ${data?.message_2}`,
    icon: '/icon-192x192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
self.addEventListener("notificationclick", function (event) {
  console.log(event);
});