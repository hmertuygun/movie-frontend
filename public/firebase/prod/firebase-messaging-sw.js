importScripts("https://www.gstatic.com/firebasejs/8.2.10/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.10/firebase-messaging.js");
const firebaseConfig = {
  apiKey: "AIzaSyC5I1i33SA0L4TVpRuAhLBFq4Klz8k3Zck",
  projectId: "coinpanel-prod",
  appId: "1:22625478151:web:a54febfe4b773a80f7aca2",
  messagingSenderId: "",
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
      return registration.showNotification("my notification title");
    });
  return promiseChain;
});
self.addEventListener("notificationclick", function (event) {
  console.log(event);
});