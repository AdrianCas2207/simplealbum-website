// ===================== LOGIN =====================
function login(){

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if(!username || !password){
        Swal.fire("Please fill all fields");
        return;
    }

    fetch("login.php",{
        method:"POST",
        headers:{
            "Content-Type":"application/x-www-form-urlencoded"
        },
        body:`username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    })
    .then(res=>res.json())
    .then(data=>{

        if(data.status==="success"){

            localStorage.setItem("loggedUser",data.name);
localStorage.setItem("role",data.role);
localStorage.setItem("userId",data.id);
localStorage.setItem("viewState","upload");
            Swal.fire({
                icon:"success",
                title:"Login Successful",
                text:"Welcome " + data.name
            }).then(()=>{
                window.location.href="dashboard.html";
            });

        }else{
            Swal.fire("Login Failed",data.message,"error");
        }
    });
}


// ===================== REGISTER PAGE =====================
function goRegister(){
    window.location.href = "register.html";
}


// ===================== REGISTER =====================
function register(){

    const username = document.getElementById("regUsername").value.trim();
    const name = document.getElementById("regName").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if(!username || !name || !password){
        Swal.fire("Fill all fields");
        return;
    }

    fetch("register.php",{
        method:"POST",
        headers:{
            "Content-Type":"application/x-www-form-urlencoded"
        },
        body:`username=${encodeURIComponent(username)}&name=${encodeURIComponent(name)}&password=${encodeURIComponent(password)}`
    })
    .then(res=>res.text())
    .then(data=>{

        data = data.trim();

        if(data.includes("success")){

            Swal.fire({
                icon:"success",
                title:"Account Created Successfully"
            }).then(()=>{
                window.location.href="index.html";
            });

        } else {
            Swal.fire("Error",data,"error");
        }
    });
}


// ===================== LOAD USER =====================
function loadUser(){

    let user = localStorage.getItem("loggedUser");
    let role = localStorage.getItem("role");

    if(!user){
        window.location.href="index.html";
        return;
    }

    if(role === "admin"){
        document.getElementById("usersBtn").style.display = "block";
        document.getElementById("uploadsBtn").style.display = "block";
    }

    let header = document.getElementById("headerWelcome");
    if(header){
        header.innerText = "Welcome, " + user;
    }
}


// ===================== LOGOUT =====================
function logout(){

    Swal.fire({
        icon:"success",
        title:"Logged Out"
    }).then(()=>{

        localStorage.removeItem("loggedUser");
        localStorage.removeItem("role");
        localStorage.removeItem("viewState");

        window.location.href="index.html";
    });
}


// ===================== NAVIGATION =====================
function showUpload(){
    hideAllSections();
    document.getElementById("uploadSection").style.display="block";
    localStorage.setItem("viewState","upload");
}

function showAlbum(){
    hideAllSections();
    document.getElementById("albumSection").style.display="block";
    localStorage.setItem("viewState","album");
    loadAlbum();
}

function showUsers(){
    hideAllSections();
    document.getElementById("usersSection").style.display="block";
    localStorage.setItem("viewState","users");
    loadUsers();
}

function showAllUploads(){
    hideAllSections();
    document.getElementById("allUploadsSection").style.display="block";
    localStorage.setItem("viewState","uploads");
    loadAllUploads();
}

function hideAllSections(){

    let sections = [
        "uploadSection",
        "albumSection",
        "usersSection",
        "allUploadsSection"
    ];

    sections.forEach(id=>{
        let el = document.getElementById(id);
        if(el){
            el.style.display="none";
        }
    });
}


// ===================== UPLOAD IMAGE =====================
function uploadImage(){

    let file = document.getElementById("imageInput").files[0];

    if(!file){
        Swal.fire({
            icon:"warning",
            title:"No Image Selected"
        });
        return;
    }

    Swal.fire({
        title:"Uploading...",
        allowOutsideClick:false,
        didOpen:()=>{
            Swal.showLoading();
        }
    });

    let fd = new FormData();
fd.append("image", file);

let userId = localStorage.getItem("userId");
fd.append("user_id", userId);

    fetch("upload.php",{
        method:"POST",
        body:fd
    })
    .then(res=>res.text())
    .then(data=>{

        Swal.close();

        if(data.trim()==="success"){
            Swal.fire("Uploaded Successfully","","success");
            loadAlbum();
        }else{
            Swal.fire("Error",data,"error");
        }
    });
}


// ===================== LOAD ALBUM =====================
function loadAlbum(){

    fetch("get_memories.php")
    .then(res=>res.json())
    .then(data=>{

        let grid = document.getElementById("memoryGrid");
        grid.innerHTML="";

        data.forEach(item=>{

            grid.innerHTML += `
                <div class="memory-card">
                    <img src="${item.image}">
                    <div class="menu">
                        <span onclick="toggleMenu(${item.id})">⋮</span>
                        <div class="dropdown" id="menu-${item.id}">
                            <button onclick="deletePhoto(${item.id})">Delete</button>
                        </div>
                    </div>
                    <div class="date">${formatDate(item.created_at)}</div>
                </div>
            `;
        });
    });
}


// ===================== LOAD ALL USER UPLOADS =====================
function loadAllUploads(){

    fetch("admin_get_grouped.php")
    .then(res => res.json())
    .then(data => {

        let container = document.getElementById("allUploadsList");
        container.innerHTML = "";

        Object.keys(data).forEach(user => {

            let imagesHTML = "";

            data[user].forEach(img => {

                imagesHTML += `
                    <div class="admin-img-card">
                        <img src="${img.image}">
                        <div class="img-date">${formatDate(img.created_at)}</div>
                    </div>
                `;
            });

            container.innerHTML += `
                <div class="admin-user-card">

                    <div class="user-header">
                        👤 ${user}
                    </div>

                    <div class="admin-grid">
                        ${imagesHTML}
                    </div>

                </div>
            `;
        });
    });
}

// ===================== DELETE PHOTO =====================
function deletePhoto(id){

    Swal.fire({
        title:"Delete this photo?",
        icon:"warning",
        showCancelButton:true
    }).then((result)=>{

        if(result.isConfirmed){

            fetch("delete_memory.php",{
                method:"POST",
                headers:{
                    "Content-Type":"application/x-www-form-urlencoded"
                },
                body:`id=${id}`
            })
            .then(()=>{

                Swal.fire("Deleted","","success");
                loadAlbum();
                loadAllUploads();
            });
        }
    });
}


// ===================== MENU =====================
function toggleMenu(id){

    let el = document.getElementById("menu-"+id);

    if(el){
        el.style.display = el.style.display==="block" ? "none" : "block";
    }
}


// ===================== ADMIN USERS =====================
function loadUsers(){

    fetch("get_users.php")
    .then(res=>res.json())
    .then(data=>{

        let usersList = document.getElementById("usersList");
        usersList.innerHTML="";

        data.forEach(user=>{

            usersList.innerHTML += `
                <div class="user-card">
                    <h3>${user.name}</h3>
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Status:</strong> ${user.status}</p>

                    <div class="user-actions">
                        <button class="edit-btn" onclick="editUser(${user.id},'${user.name}','${user.username}')">Edit</button>

                        <button class="suspend-btn" onclick="toggleUser(${user.id},'${user.status}')">
                            ${user.status==="active"?"Suspend":"Unsuspend"}
                        </button>

                        <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
                    </div>
                </div>
            `;
        });
    });
}


function toggleUser(id,status){

    fetch("toggle_user.php",{
        method:"POST",
        headers:{
            "Content-Type":"application/x-www-form-urlencoded"
        },
        body:`id=${id}&status=${status}`
    })
    .then(()=>{
        Swal.fire("Updated","","success");
        loadUsers();
    });
}


function deleteUser(id){

    Swal.fire({
        title:"Delete this user?",
        icon:"warning",
        showCancelButton:true
    }).then((result)=>{

        if(result.isConfirmed){

            fetch("delete_user.php",{
                method:"POST",
                headers:{
                    "Content-Type":"application/x-www-form-urlencoded"
                },
                body:`id=${id}`
            })
            .then(()=>{
                Swal.fire("Deleted","","success");
                loadUsers();
            });
        }
    });
}


function editUser(id,currentName,currentUsername){

    Swal.fire({
        title:'Edit User',
        html:`
            <input id="editName" class="swal2-input" value="${currentName}">
            <input id="editUsername" class="swal2-input" value="${currentUsername}">
        `,
        showCancelButton:true
    }).then((result)=>{

        if(result.isConfirmed){

            const name = document.getElementById("editName").value;
            const username = document.getElementById("editUsername").value;

            fetch("update_user.php",{
                method:"POST",
                headers:{
                    "Content-Type":"application/x-www-form-urlencoded"
                },
                body:`id=${id}&name=${encodeURIComponent(name)}&username=${encodeURIComponent(username)}`
            })
            .then(()=>{
                Swal.fire("Updated","","success");
                loadUsers();
            });
        }
    });
}


// ===================== DATE FORMAT =====================
function formatDate(dateString){

    const date = new Date(dateString);

    const months = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}


// ===================== PAGE LOAD =====================
window.onload=function(){

    if(document.getElementById("uploadSection")){

        loadUser();

        let state = localStorage.getItem("viewState");

        if(state==="album"){
            showAlbum();
        }
        else if(state==="users"){
            showUsers();
        }
        else if(state==="uploads"){
            showAllUploads();
        }
        else{
            showUpload();
        }
    }
};