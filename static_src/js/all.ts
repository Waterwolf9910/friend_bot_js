let login = document.getElementById("login")
let logout = document.getElementById("logout")

login?.addEventListener("click", () => {
    console.log("Going to login flow...")
    location.href = "/friend_bot/getLogin"
})

logout?.addEventListener("click", () => {
    console.log("Loging out...")
    location.href = "/friend_bot/logout"
})

