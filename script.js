const firebaseConfig = {
  apiKey: "AIzaSyDpv3NaTYjrmeoN19itDACcvEpMggd72H8",
  authDomain: "url-c576f.firebaseapp.com",
  projectId: "url-c576f",
  storageBucket: "url-c576f.firebasestorage.app",
  messagingSenderId: "681639648878",
  appId: "1:681639648878:web:31d36b7e0c8031c806d07f",
  measurementId: "G-HKS96B2T7T"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// index.html
if (document.getElementById("generateBtn")) {
  db.collection("stats").doc("total").onSnapshot(doc => {
    document.getElementById("visits").textContent = (doc.data()?.count || 0).toLocaleString();
  });

  document.getElementById("generateBtn").onclick = async () => {
    const content = document.getElementById("contentUrl").value.trim();
    const ad = document.getElementById("adUrl").value.trim();
    const file = document.getElementById("image").files[0];
    if (!content || !ad || !file) return alert("সব ফিল্ড পূরণ করো!");

    document.getElementById("loader").style.display = "block";
    document.getElementById("generateBtn").disabled = true;

    const id = Math.random().toString(36).substring(2, 10);
    const shortLink = location.origin + "/view.html?id=" + id;

    const ref = firebase.storage().ref("thumbs/" + id);
    await ref.put(file);
    const imageUrl = await ref.getDownloadURL();

    await db.collection("links").doc(id).set({ content, ad, imageUrl });

    window.location.href = `success.html?id=${id}&url=${encodeURIComponent(shortLink)}`;
  };
}

// view.html
if (document.getElementById("thumb")) {
  let adLink = "", finalLink = "", clicked = false;
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  db.collection("links").doc(id).get().then(doc => {
    if (doc.exists) {
      const d = doc.data();
      adLink = d.ad;
      finalLink = d.content;
      document.getElementById("thumb").src = d.imageUrl;

      db.collection("stats").doc("total").set({count: firebase.firestore.FieldValue.increment(1)}, {merge: true});
    }
  });

  document.querySelectorAll(".btn").forEach(btn => btn.onclick = () => location.href = adLink || "#");

  document.getElementById("startBtn").onclick = () => {
    document.getElementById("startBtn").style.display = "none";
    let t = 5;
    const timer = setInterval(() => {
      t--;
      document.getElementById("countdown").textContent = t;
      if (t <= 0) {
        clearInterval(timer);
        document.getElementById("countdown").textContent = "Ready!";
        document.getElementById("finalGetLink").style.display = "block";
      }
    }, 1000);
  };

  document.getElementById("finalGetLink").onclick = () => {
    if (!clicked) { clicked = true; location.href = adLink; }
    else { location.href = finalLink; }
  };
}

// success.html
if (document.getElementById("shortLink")) {
  const params = new URLSearchParams(location.search);
  const url = decodeURIComponent(params.get("url") || "");
  document.getElementById("shortLink").textContent = url;
  document.getElementById("copyBtn").onclick = () => {
    navigator.clipboard.writeText(url).then(() => alert("কপি হয়েছে!"));
  };
}
