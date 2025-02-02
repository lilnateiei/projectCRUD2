const BASE_URL = "https://67950ceeaad755a134eb14bf.mockapi.io";
const TOKEN_KEY = "token"; 
const SECRET_KEY = "mysecret";  

// ตรวจสอบว่า token ถูกต้องหรือไม่
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
      localStorage.removeItem(TOKEN_KEY);  // ลบ token ที่หมดอายุ
      return false;
    }

    return true;
  } catch (error) {
    console.error("ข้อผิดพลาดในการตรวจสอบ token:", error);
    return false;
  }
};


window.onload = async () => {
  if (!checkToken()) {
    alert("token ไม่ถูกต้อง หรือ หมดอายุ");
    window.location.href = "./index.html"; // เปลี่ยนหน้าไปที่หน้า index.html
    return;  // หยุดทำงานของโค้ดต่อไป
  }
  await loadData();
};

// ฟังก์ชันการโหลดข้อมูล
const loadData = async (searchQuery = "") => {

  let exsercise = [];

  if (!isNaN(searchQuery) && searchQuery !== "") {
    // ค้นหาข้อมูลจาก ID
    const response = await axios.get(`${BASE_URL}/exsercise/${searchQuery}`);
    exsercise = response.data ? [response.data] : [];  
  } else {
    // ค้นหาทั้งหมด
    const response = await axios.get(`${BASE_URL}/exsercise`);
    exsercise = response.data;
  }

  if (searchQuery && isNaN(searchQuery)) {
    // ค้นหาข้อมูลจากชื่อกล้ามเนื้อหรือท่าออกกำลังกาย
    exsercise = exsercise.filter(
      (exsercise) =>
        String(exsercise.muscle)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(exsercise.workout)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }

  let exserciseHTMLData = `
    <table class="table" border="1" cellspacing="1" cellpadding="5">
      <thead>
        <tr class="bg-blue-200 text-white text-center">
          <th>ส่วนกล้ามเนื้อ</th>
          <th>ท่าออกกำลังกาย</th>
          <th>เซ็ตที่ออกกำลังกาย</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>`;

  // แสดงข้อมูลจาก API
  for (let i = 0; i < exsercise.length; i++) {
    exserciseHTMLData += `
      <tr>
        <td class="text-center">${exsercise[i].muscle}</td>
        <td class="text-center">${exsercise[i].workout}</td>
        <td class="text-center">${exsercise[i].setup}</td>
        <td class="text-center">
          <button class="btn btn-outline btn-success text-white" onclick="editUser('${exsercise[i].id}')">
            Edit<i class="fa-solid fa-pencil"></i>
          </button>
          <button class="delete btn btn-outline btn-error text-center" data-id="${exsercise[i].id}">
            Delete<i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>`;
  }

  exserciseHTMLData += `</tbody></table>`;
  let exserciseDOM = document.getElementById("exsercise");
  exserciseDOM.innerHTML = exserciseHTMLData;

  let deleteDOMs = document.querySelectorAll(".delete");
  deleteDOMs.forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      let id = event.target.dataset.id;
      try {
        await axios.delete(`${BASE_URL}/exsercise/${id}`);
        loadData();
      } catch (error) {
        console.log(error);
      }
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("edit")) {
    await loadData();
  }
};

const editUser = (id) => {
  window.location.href = `./create.html?id=${id}&edited=true`;
};

const SearchQuery = async () => {
  const searchInput = document.getElementById("search").value;
  await loadData(searchInput);
};

const submitData = async () => {
  const muscleDOM = document.getElementById("muscle-group");
  const workoutDOM = document.getElementById("exercise");
  const setupDOM = document.getElementById("sets");

  if (!muscleDOM || !workoutDOM || !setupDOM) {
    alert("ไม่พบ input field ที่ต้องการในหน้าเว็บ กรุณาตรวจสอบ ID ของ input fields");
    return;
  }

  const exserciseData = {
    muscle: muscleDOM.value,
    workout: workoutDOM.value,
    setup: setupDOM.value,
  };

  try {
    await axios.post(`${BASE_URL}/exsercise`, exserciseData);
    alert("เพิ่มข้อมูลสำเร็จ!");
    window.location.href = "exsercise.html";
  } catch (error) {
    console.log(error);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
};