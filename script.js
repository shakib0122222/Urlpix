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
const storage = firebase.storage();

// index.html
if (document.getElementById("generateBtn")) {
  db.collection("stats").doc("total").onSnapshot(doc => {
    document.getElementById("visits").textContent = (doc.data()?.count || 0).toLocaleString();
  });

  document.getElementById("generateBtn").onclick = async () => {
    const contentUrl = document.getElementById("contentUrl").value.trim();
    const adUrl = document.getElementById("adUrl").value.trim();
    const file = document.getElementById("image").files[0];

    if (!contentUrl || !adUrl || !file) return alert("সবকিছু পূরণ করুন!");

    document.getElementById("loader").style.display = "block";
    document.getElementById("generateBtn").disabled = true;
    document.getElementById("generateBtn").textContent = "তৈরি হচ্ছে...";

    try {
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
      const shortLink = location.origin + "/view.html?id=" + id;

      const uploadTask = await storage.ref(`thumbs/${id}`).put(file);
      const imageUrl = await uploadTask.ref.getDownloadURL();

      await db.collection("links").doc(id).set({
        content: contentUrl,
        ad: adUrl,
        imageUrl: imageUrl,
        created: firebase.firestore.FieldValue.serverTimestamp()
      });

      window.location.href = `success.html?id=${id}&url=${encodeURIComponent(shortLink)}`;

    } catch (err) {
      alert("Error: " + err.message);
      document.getElementById("loader").style.display = "none";
      document.getElementById("generateBtn").disabled = false;
      document.getElementById("generateBtn").textContent = "Generate Short Link";
    }
  };
}

// view.html
if (document.getElementById("thumb")) {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  let ad = "", content = "", first = true;

  db.collection("links").doc(id).get().then(doc => {
    if (doc.exists) {
      const d = doc.data();
      ad = d.ad; content = d.content;
      document.getElementById("thumb").src = d.imageUrl;

      db.collection("stats").doc("total").set({count: firebase.firestore.FieldValue.increment(1)}, {merge: true});
    }
  });

  document.querySelectorAll(".btn").forEach(b => b.onclick = () => location.href = ad);
  document.getElementById("startBtn").onclick = () => {
    document.getElementById("startBtn").style.display = "none";
    let t = 5;
    const int = setInterval(() => {
      t--;
      document.getElementById("countdown").textContent = t;
      if (t <= 0) { clearInterval(int); document.getElementById("countdown").textContent = "Ready!"; document.getElementById("finalGetLink").style.display = "block"; }
    }, 1000);
  };

  document.getElementById("finalGetLink").onclick = () => {
    if (first) { first = false; location.href = ad; } else { location.href = content; }
  };
}

// success.html
if (document.getElementById("shortLink")) {
  const p = new URLSearchParams(location.search);
  const url = decodeURIComponent(p.get("url") || "");
  document.getElementById("shortLink").textContent = url;
  document.getElementById("copyBtn").onclick = () => {
    navigator.clipboard.writeText(url).then(() => {
      document.getElementById("copyBtn").textContent = "কপি হয়েছে!";
      setTimeout(() => document.getElementById("copyBtn").textContent = "Copy Link", 2000);
    });
  };
}
