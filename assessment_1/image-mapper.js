const fileTag = document.getElementById("filetag"),
  preview = document.getElementById("preview"),
  img_container = document.querySelector(".img-container"),
  img_desc = document.querySelector(".image-description"),
  table = document.getElementById("table"),
  table_wrapper = document.querySelector(".table-wrapper"),
  modal = document.getElementById("modal"),
  save_btn = document.getElementById("save"),
  cancel_btn = document.getElementById("cancel"),
  desc_input = document.getElementById("desc_input"),
  point = document.getElementById("dot"),
  tableBody = document.querySelector("#table tbody");
  image_height = (window.innerHeight * 3) / 4;

// let desc_list=[];
// let xpos=0,ypos=0,desc="";
let desc_obj = { xpos: null, ypos: null, desc: null };

img_container.style.maxHeight = image_height + "px";
preview.style.maxHeight = image_height + "px";
table.setAttribute("maxHeight", window.innerHeight - 50 + "px");
table_wrapper.style.maxHeight = window.innerHeight - 50 + "px";

function changeImage(input) {
  let reader;

  if (input.files && input.files[0]) {
    if (!input.files[0].type.includes("image")) {
      alert("Please select a Image");
      return;
    }
    let width, height;
    tableBody.innerHTML=``;
    point.style.display='none';

    reader = new FileReader();
    reader.readAsDataURL(input.files[0]);
    reader.onload = function (e) {
      preview.setAttribute("src", e.target.result);
      preview.onload = function () {
        width = this.naturalWidth;
        height = this.naturalHeight;
        img_desc.innerHTML = `
    <ul>
        <li><span><strong>Name: </strong>${input.files[0].name}</span></li>
        <li><span><strong>Dimensions: </strong>${
          width + "x" + height
        }</span></li>
        <li><span><strong>MiME Type: </strong>${input.files[0].type}</span></li>
    </ul>
    `;
      };
    };
    // console.log(preview.naturalWidth,preview.naturalHeight);
  }
}

function renderTable() {
  
  let tr = document.createElement("tr");
  tableBody.appendChild(tr);
  for (let key in desc_obj) {
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(desc_obj[key]));
    tr.appendChild(td);
  }
}

fileTag.addEventListener("change", function () {
  changeImage(this);
});
preview.addEventListener("click", (ev) => {
  desc_obj.xpos = ev.clientX;
  desc_obj.ypos = ev.clientY;
  modal.style.display = "block";
  modal.style.left=desc_obj.xpos+"px";
  modal.style.top=desc_obj.ypos+"px";
});

save_btn.addEventListener("click", () => {
  let value = desc_input.value;
  if (value.trim()) {
    desc_obj.desc = value;
    document.querySelector('.tooltip-text').textContent=desc_obj.desc;
    point.style.display='block';
    renderTable();
    desc_input.value='';
    modal.style.display = "none";
    return;
  }
});
cancel_btn.addEventListener("click",()=>{
  desc_input.value='';
  modal.style.display = "none";
})
