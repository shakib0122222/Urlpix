const firebaseConfig = {apiKey:"AIzaSyDpv3NaTYjrmeoN19itDACcvEpMggd72H8",authDomain:"url-c576f.firebaseapp.com",projectId:"url-c576f",storageBucket:"url-c576f.firebasestorage.app",messagingSenderId:"681639648878",appId:"1:681639648878:web:31d36b7e0c8031c806d07f",measurementId:"G-HKS96B2T7T"};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const st = firebase.storage();

// ====== INDEX PAGE ======
if (document.getElementById("generateBtn")) {
  db.collection("stats").doc("v").onSnapshot(d => document.getElementById("visits").textContent = (d.data()?.c || 0).toLocaleString());

  document.getElementById("generateBtn").onclick = async () => {
    const c = document.getElementById("contentUrl").value.trim();
    const a = document.getElementById("adUrl").value.trim();
    const f = document.getElementById("image").files[0];
    if (!c || !a || !f) return alert("সব পূরণ করুন!");

    document.getElementById("loader").style.display = "block";
    document.getElementById("generateBtn").disabled = true;

    try {
      const id = Date.now().toString(36);
      const link = location.origin + "/view.html?id=" + id;

      await st.ref("i/" + id).put(f);
      const img = await st.ref("i/" + id).getDownloadURL();

      await db.collection("links").doc(id).set({c, a, img});

      location.href = "success.html?u=" + btoa(link);
    } catch (e) {
      document.getElementById("msg").textContent = "Error: " + e.message;
      document.getElementById("loader").style.display = "none";
      document.getElementById("generateBtn").disabled = false;
    }
  };
}

// ====== VIEW PAGE ======
if (document.getElementById("thumb")) {
  const id = new URLSearchParams(location.search).get("id");
  let ad = "", content = "", first = true;

  db.collection("links").doc(id).get().then(d => {
    if (d.exists) {
      const x = d.data();
      ad = x.a; content = x.c;
      document.getElementById("thumb").src = x.img;
      db.collection("stats").doc("v").set({c: firebase.firestore.FieldValue.increment(1)}, {merge:true});
    }
  });

  document.querySelectorAll(".btn").forEach(b => b.onclick = () => location.href = ad);
  document.getElementById("startBtn").onclick = () => {
    document.getElementById("startBtn").style.display = "none";
    let t = 5;
    const i = setInterval(() => {
      t--;
      document.getElementById("countdown").textContent = t;
      if (t <= 0) { clearInterval(i); document.getElementById("countdown").textContent = "Ready!"; document.getElementById("finalGetLink").style.display = "block"; }
    }, 1000);
  };
  document.getElementById("finalGetLink").onclick = () => first ? (first=false, location.href=ad) : location.href=content;
}

// ====== SUCCESS PAGE ======
if (document.getElementById("shortLink")) {
  const u = atob(new URLSearchParams(location.search).get("u")||"");
  document.getElementById("shortLink").textContent = u;
  document.getElementById("copyBtn").onclick = () => {
    navigator.clipboard.writeText(u);
    document.getElementById("copyBtn").textContent = "কপি হয়েছে!";
    setTimeout(() => document.getElementById("copyBtn").textContent = "Copy Link", 2000);
  };
      }
