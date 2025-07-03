document.addEventListener("DOMContentLoaded", () => {
    const login_form = document.getElementById("login_form");
    login_form.addEventListener("submit", (e) => {
        e.preventDefault();
        login();
    });
});

const basePath = window.location.pathname.includes('PMFveslanje') 
  ? '/PMFveslanje/' 
  : '/';


async function getUserByUsername(username) {
    const res = await fetch(basePath + 'data/tempdata.JSON');
    const data = await res.json();
    const user = data.users.find(user => user.ime === username);
    if (user) {
        console.log("User found:", user);
        return user;
    } else {
        console.log("User not found");
        return null;
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const usr = await getUserByUsername(username);

    console.log(usr);
    if (usr) {
        if (usr.password === password) {
            console.log("Login successful");
            sessionStorage.setItem('user', JSON.stringify(usr))
            window.location.href = basePath + "client/dashboard.html";
        }
        else {
            alert("Krivi password");
        }
    }
    else {
        alert("Korisnik ne postoji");
    }
}