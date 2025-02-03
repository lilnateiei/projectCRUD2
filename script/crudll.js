const BASE_URL = "https://679ccfb987618946e6537ec9.mockapi.io/";
const TOKEN_KEY = "token";   
const SECRET_KEY = "mysecret";   

let mode = "ADD"; 
let selectedId = null; 

const checkToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    window.location.href = "./index.html";
    return false;
  }
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) {
      window.location.href = "./index.html";
      return false;
    }
    const validSignature = btoa(`${header}.${body}.${SECRET_KEY}`);
    if (signature !== validSignature) {
      window.location.href = "./index.html";
      return false;
    }
    const payload = JSON.parse(atob(body));
    const currentTime = Math.floor(Date.now() / 1000);   
    if (payload.exp < currentTime) {
      alert("Token หมดอายุ กรุณาเข้าสู่ระบบใหม่");
      localStorage.removeItem(TOKEN_KEY);   
      window.location.href = "./index.html";  
      return false;
    }
    return true;
  } catch (error) {
    console.error("ข้อผิดพลาดในการตรวจสอบ token:", error);
    window.location.href = "./index.html";
    return false;
  }
};

window.onload = () => {
  if (!checkToken()) {
    alert("token ไม่ถูกต้อง หรือ หมดอายุ");
    window.location.href = "./index.html";
    return;
  }
  initializeCRUD();
};

const initializeCRUD = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (id) {
    mode = "EDIT";
    selectedId = id;
    try {
      const response = await axios.get(`${BASE_URL}/course/${id}`);
      const course = response.data;
      if (course) {
        document.querySelector("input[name=langue]").value = course.langue || "";
        document.querySelector("input[name=hour]").value = course.hour || "";
        document.querySelector("input[name=des]").value = course.des || "";
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
};

const validateData = (courseData) => {
  let errors = [];
  if (!courseData.langue) {
    errors.push("กรุณากรอกภาษาที่จะสอนในคอร์ส");
  }
  if (!courseData.hour) {
    errors.push("กรุณากรอกชั่วโมงที่จะเรียนในคอร์ส");
  }
  if (!courseData.des) {
    errors.push("กรุณากรอกคำอธิบาย");
  }
  return errors;
};

const showModal = (message, isSuccess = false) => {
  const popupMessage = document.getElementById('popupMessage');
  popupMessage.textContent = message;
  
  const popupIcon = document.getElementById('popupIcon');
  if (isSuccess) {
    popupIcon.innerHTML = '<i class="fa-solid fa-check-circle text-green-500 text-4xl"></i>';
  } else {
    popupIcon.innerHTML = '<i class="fa-solid fa-x-circle text-red-500 text-4xl"></i>';
  }

  const modelConfirm = document.getElementById('modelConfirm');
  modelConfirm.classList.remove('hidden');
};

const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  modal.classList.add('hidden');
};

const submitData = async () => {
  const courseData = {
    langue: document.querySelector("input[name=langue]").value,
    hour: document.querySelector("input[name=hour]").value,
    des: document.querySelector("input[name=des]").value,
  };

  const errors = validateData(courseData);
  if (errors.length > 0) {
    showModal(errors.join("\n"), false);
    return;
  }

  try {
    let response;
    let successText = "เพิ่มข้อมูลเรียบร้อย!";
    if (mode === "EDIT") {
      response = await axios.put(`${BASE_URL}/course/${selectedId}`, courseData);
      successText = "แก้ไขข้อมูลเรียบร้อย!";
    } else {
      response = await axios.post(`${BASE_URL}/course`, courseData);
    }
    showModal(successText, true);
  } catch (error) {
    console.error("Error:", error);
    showModal("เกิดข้อผิดพลาดในการส่งข้อมูล", false);
  }
};
