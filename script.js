const firebaseConfig = { // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpv3NaTYjrmeoN19itDACcvEpMggd72H8",
  authDomain: "url-c576f.firebaseapp.com",
  projectId: "url-c576f",
  storageBucket: "url-c576f.firebasestorage.app",
  messagingSenderId: "681639648878",
  appId: "1:681639648878:web:31d36b7e0c8031c806d07f",
  measurementId: "G-HKS96B2T7T"
}; };  
firebase.initializeApp(firebaseConfig);  
const db = firebase.firestore();  
const storage = firebase.storage();  

// index.html  
if (document.getElementById("generateBtn")) {  
  db.collection("stats").doc("total").onSnapshot(doc => {  
    document.getElementById("visits").textContent = (doc.data()?.count || 0).toLocaleString();  
  });  

  document.getElementById("generateBtn").onclick = async () => {  
    const content = document.getElementById("contentUrl").value.trim();  
    const ad = document.getElementById("adUrl").value.trim();  
    const file = document.getElementById("image").files[0];  
    if (!content || !ad || !file) return alert("পূরণ করো");  

    document.getElementById("loader").style.display = "block";  

    try {  
      const id = Math.random().toString(36).substring(2, 12);  
      const shortLink = location.origin + "/view.html?id=" + id;  

      const ref = storage.ref('images/' + id);  
      await ref.put(file);  
      const imgUrl = await ref.getDownloadURL();  

      await db.collection("links").doc(id).set({content, ad, imgUrl});  

      location.href = `success.html?u=${encodeURIComponent(shortLink)}`;  
    } catch (e) {  
      alert("Error: " + e.message);  
      document.getElementById("loader").style.display = "none";  
    }  
  };  
}  

// view.html  
if (document.getElementById("thumb")) {  
  const params = new URLSearchParams(location.search);  
  const id = params.get('id');  
  let adUrl = "", contentUrl = "", firstClick = true;  

  db.collection("links").doc(id).get().then(doc => {  
    if (doc.exists) {  
      const data = doc.data();  
      adUrl = data.ad;  
      contentUrl = data.content;  
      document.getElementById("thumb").src = data.imgUrl;  

      db.collection("stats").doc("total").set({count: firebase.firestore.FieldValue.increment(1)}, {merge: true});  
    }  
  });  

  document.querySelectorAll(".btn").forEach(btn => btn.onclick = () => location.href = adUrl);  

  document.getElementById("startBtn").onclick = () => {  
    document.getElementById("startBtn").style.display = "none";  
    let time = 5;  
    const timer = setInterval(() => {  
      time--;  
      document.getElementById("countdown").textContent = time;  
      if (time <= 0) {  
        clearInterval(timer);  
        document.getElementById("countdown").textContent = "Ready!";  
        document.getElementById("finalGetLink").style.display = "block";  
      }  
    }, 1000);  
  };  

  document.getElementById("finalGetLink").onclick = () => {  
    if (firstClick) { firstClick = false; location.href = adUrl; }  
    else { location.href = contentUrl; }  
  };  
}  

// success.html  
if (document.getElementById("shortLink")) {  
  const params = new URLSearchParams(location.search);  
  const url = decodeURIComponent(params.get('u') || "");  
  document.getElementById("shortLink").textContent = url;  
  document.getElementById("copyBtn").onclick = () => navigator.clipboard.writeText(url).then(() => alert("কপি হয়েছে!"));  
}
