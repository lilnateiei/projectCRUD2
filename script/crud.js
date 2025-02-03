const BASE_URL = "https://67950ceeaad755a134eb14bf.mockapi.io";
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
      const response = await axios.get(`${BASE_URL}/exsercise/${id}`);
      const exsercise = response.data;
      if (exsercise) {
        document.querySelector("input[name=muscle]").value = exsercise.muscle || "";
        document.querySelector("input[name=workout]").value = exsercise.workout || "";
        document.querySelector("input[name=setup]").value = exsercise.setup || "";
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
};

const validateData = (exserciseData) => {
  let errors = [];
  if (!exserciseData.muscle) {
    errors.push("กรุณากรอกส่วนกล้ามเนื้อที่ต้องการเล่น");
  }
  if (!exserciseData.workout) {
    errors.push("กรุณากรอกท่าออกกำลังกาย");
  }
  if (!exserciseData.setup) {
    errors.push("กรุณากรอกเซ็ตที่จะเล่น");
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
  const exserciseData = {
    muscle: document.querySelector("input[name=muscle]").value,
    workout: document.querySelector("input[name=workout]").value,
    setup: document.querySelector("input[name=setup]").value,
  };

  const errors = validateData(exserciseData);
  if (errors.length > 0) {
    showModal(errors.join("\n"), false);
    return;
  }

  try {
    let response;
    let successText = "เพิ่มข้อมูลเรียบร้อย!";
    if (mode === "EDIT") {
      response = await axios.put(`${BASE_URL}/exsercise/${selectedId}`, exserciseData);
      successText = "แก้ไขข้อมูลเรียบร้อย!";
    } else {
      response = await axios.post(`${BASE_URL}/exsercise`, exserciseData);
    }
    showModal(successText, true);
  } catch (error) {
    console.error("Error:", error);
    showModal("เกิดข้อผิดพลาดในการส่งข้อมูล", false);
  }
};
