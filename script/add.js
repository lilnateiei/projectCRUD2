const BASE_URL = "https://679ccfb987618946e6537ec9.mockapi.io/";

window.onload = async () => {
  await loadData();
};

const loadData = async (SearchQuery = "") => {
  let courses = [];

  try {
    let response;
    if (!isNaN(SearchQuery) && SearchQuery !== "") {
      response = await axios.get(`${BASE_URL}course/${SearchQuery}`); // ✅ แก้ path ให้ถูกต้อง
      courses = response.data ? [response.data] : [];
    } else {
      response = await axios.get(`${BASE_URL}course`); // ✅ ไม่มี "/" ท้ายสุด
      courses = response.data;
    }

    if (SearchQuery && isNaN(SearchQuery)) {
      courses = courses.filter(
        (course) =>
          String(course.langue).toLowerCase().includes(SearchQuery.toLowerCase()) ||
          String(course.des).toLowerCase().includes(SearchQuery.toLowerCase())
      );
    }

    let courseHTMLData = `
      <table class="table-auto border-2 border-gray-300 border-opacity-50 w-full mt-5 shadow-lg rounded-xl">
        <thead class="bg-blue-400">
          <tr>
            <th class="px-4 py-2 text-white">ภาษา</th>
            <th class="px-4 py-2 text-white">ชั่วโมง</th>
            <th class="px-4 py-2 text-white">คำอธิบาย</th>
            <th class="px-4 py-2 text-white">จัดการ</th>
          </tr>
        </thead>
        <tbody>`;

    courses.forEach((course) => {
      courseHTMLData += `
        <tr class="bg-blue-100">
          <td class="px-4 py-2 text-black text-center">${course.langue}</td>
          <td class="px-4 py-2 text-black text-center">${course.hour}</td>
          <td class="px-4 py-2 text-black text-center">${course.des}</td>
          <td class="px-4 py-2 text-black text-center">
            <button class="btn btn-outline btn-success text-center" onclick="editCourse('${course.id}')">
              Edit <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="btn btn-outline btn-error text-center delete" data-id="${course.id}">
              Delete <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>`;
    });

    courseHTMLData += `</tbody></table>`;
    document.getElementById("course").innerHTML = courseHTMLData;

    let deleteDOMs = document.querySelectorAll(".delete");
    deleteDOMs.forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        let id = event.target.dataset.id;
        try {
          await axios.delete(`${BASE_URL}course/${id}`); // ✅ ตรวจสอบ URL
          loadData();
        } catch (error) {
          console.log("Delete Error:", error);
          alert("ไม่สามารถลบข้อมูลได้ กรุณาตรวจสอบ API");
        }
      });
    });

  } catch (error) {
    console.error("Load Data Error:", error);
    alert("ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ API URL หรือ Server ของคุณ");
  }
};

const editCourse = (id) => {
  window.location.href = `add.html?id=${id}&edited=true`;
};

const SearchQuery = async () => {
  const searchInput = document.getElementById("search").value;
  await loadData(searchInput);
};

const submitData = async () => {
  const langueDOM = document.getElementById("langue");
  const hourDOM = document.getElementById("hour");
  const desDOM = document.getElementById("des");

  if (!langueDOM || !hourDOM || !desDOM) {
    alert("ไม่พบช่องกรอกข้อมูล");
    return;
  }

  const courseData = {
    langue: langueDOM.value,
    hour: hourDOM.value,
    des: desDOM.value,
  };

  try {
    await axios.post(`${BASE_URL}course`, courseData); // ✅ ตรวจสอบ URL
    alert("เพิ่มข้อมูลสำเร็จ!");
    window.location.href = "course.html";
  } catch (error) {
    console.error("Submit Error:", error);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
};
