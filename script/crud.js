const BASE_URL = "https://67950ceeaad755a134eb14bf.mockapi.io";
let mode = "CREATE";
let selectedId = -1;
const TOKEN_KEY = "token";
const SECRET_KEY = "mysecret";

 const checkToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return false;
  }

  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) {
      return false;
    }

    const validSignature = btoa(`${header}.${body}.${SECRET_KEY}`);
    if (signature !== validSignature) {
      return false;
    }

    const payload = JSON.parse(atob(body));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp < currentTime) {
      alert("Token หมดอายุ กรุณาเข้าสู่ระบบใหม่");
      localStorage.removeItem(TOKEN_KEY);         
      return false;
    }

    return true;
  } catch (error) {
    console.error("ข้อผิดพลาดในการตรวจสอบ token:", error);
    return false;
  }
};

 const showModal = (message, isSuccess = false) => {
    const popupMessage = document.getElementById('popupMessage');
    popupMessage.textContent = message;
    const popupIcon = document.getElementById('popupIcon');

    
    if (isSuccess) {
        popupIcon.innerHTML = '<i class="fa-solid fa-check-circle text-green-500 text-4xl"></i>'; // ไอคอนเช็ค
    } else  {
        popupIcon.innerHTML = '<i class="fa-solid fa-x-circle text-red-500 text-4xl"></i>'; // ไอคอนกากบาท
    }

    const modelConfirm = document.getElementById('modelConfirm');
    modelConfirm.classList.remove('hidden');
};

 const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
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

    console.log('Editing exercise with ID:', selectedId);

    const muscleDOM = document.querySelector("input[name=muscle]");
    const workoutDOM = document.querySelector("input[name=exsercise]");
    const setupDOM = document.querySelector("input[name=sets]");
 

    try {
      const response = await axios.get(`${BASE_URL}/exsercise/${id}`);

      const exsercise = response.data;
      console.log(exsercise);

      if (exsercise) {
        muscleDOM.value = exsercise.muscle || "";
        workoutDOM.value = exsercise.workout || "";
        setupDOM.value = exsercise.setup || "";
        console.log("Sets:", exsercise.setup);
      } else {
        console.log("No exercise data found.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
};

   
const validateData = (exserciseData) => {
  let error = [];
  if (!exserciseData.muscle) {
    error.push("กรุณากรอกบริเวณกล้ามเนื้อที่ต้องการเล่น");
  }
  if (!exserciseData.workout) {
    error.push("กรุณากรอกท่าที่ต้องการจะเล่น");
  }
  if (!exserciseData.sets) {
    error.push("กรุณากรอกเซ็ตที่จะเล่น");
  }
  return error;
};

   
const submitData = async () => {
  const muscleDOM = document.querySelector("input[name=muscle]");
  const workoutDOM = document.querySelector("input[name=exsercise]");
  const setupDOM = document.querySelector("input[name=sets]");

  const exserciseData = {
    muscle: muscleDOM.value,
    workout: workoutDOM.value,
    sets: setupDOM.value,
  };

  const errors = validateData(exserciseData);
  if (errors.length > 0) {
    showModal(errors.join("\n") ,false);

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
