const api = "https://67950ceeaad755a134eb14bf.mockapi.io/user";
const loginForm = document.getElementById("loginForm");
const errorPopup = document.getElementById("errorPopup");
const successPopup = document.getElementById("successPopup");
const popupOverlay = document.getElementById("popup-overlay");


// สร้างtokens เก็บพารามิเตอร์ payload secret userid ผ่านapi
function createJWT(payload, secret,userid, expiresInSeconds = 120) {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = btoa(JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
        UserId:userid
    }));
    const signature = btoa(`${header}.${body}.${secret}`);
    console.log(payload,secret);
    return `${header}.${body}.${signature}`;
}





 
function showPopup(popup, overlay) {
    popup.style.display = "block";
    overlay.style.display = "block";
    setTimeout(() => {
        popup.style.display = "none";
        overlay.style.display = "none";
    }, 2000);  
}

 
function checkUserCredentials(username, password) {
    return fetch(api)
        .then(response => response.json())
        .then(users => {
          
            const user = users.find(user => user.username === username && user.password === password);
            return user;
        });
}

// รับค่าจากที่กรอกมาจาก loginFormส่งไปยังpayloadหรือพารามิเตอร์

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    
    if (!username || !password) {
        showPopup(errorPopup, popupOverlay);
        errorPopup.querySelector("p").textContent = "กรุณากรอก Username และ Password";
        return;
    }

    checkUserCredentials(username, password)
        .then(user => {
            if (user) {
                console.log(user.id)
                const token = createJWT({ username: user.username }, "mysecret",user.id, 120);

               
                localStorage.setItem("token", token);

                localStorage.setItem("email", user.email);
                localStorage.setItem("username", user.username); 

                showPopup(successPopup, popupOverlay);  

               
                setTimeout(() => {
                    console.log("Navigating to home.html");
                    window.location.href = "./home.html";
                }, 2000);   
                
            } else {
                showPopup(errorPopup, popupOverlay);   
                errorPopup.querySelector("p").textContent = "Username หรือ Password ไม่ถูกต้อง";
            }
        })
        .catch(error => {
            console.error("เกิดข้อผิดพลาดในการตรวจสอบข้อมูลผู้ใช้:", error);
            errorPopup.querySelector("p").textContent = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดลองอีกครั้ง";  
            showPopup(errorPopup, popupOverlay);   
        });
});
