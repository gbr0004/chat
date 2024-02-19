const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

const colors = ["cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold"];

const user = { id: "", name: "", color: "" };
let websocket;

const messages = [];

const createMessageSelfElement = (content) => {
    const div = document.createElement("div");
    div.classList.add("message--self");
    div.innerHTML = content;
    return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.classList.add("message--other");
    span.classList.add("message--sender");
    span.style.color = senderColor;
    div.appendChild(span);
    span.innerHTML = sender;
    div.innerHTML += content;
    return div;
};

const createAnnouncementElement = (content) => {
    const div = document.createElement("div");
    div.classList.add("announcement");
    div.textContent = content;
    return div;
};

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
    });
};

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data);

    if (content.includes("Entrou no chat") || content.includes("Saiu do chat")) {
        const announcement = createAnnouncementElement(content);
        chatMessages.appendChild(announcement);
    } else {
        const message =
            userId === user.id
                ? createMessageSelfElement(content)
                : createMessageOtherElement(content, userName, userColor);

        chatMessages.appendChild(message);
        messages.push({ userId, userName, userColor, content });
    }

    scrollScreen();
};

const announceNewUser = (userName) => {
    const entryMessage = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: `${userName} entrou no chat`,
    };
    websocket.send(JSON.stringify(entryMessage));
};

const announceExitUser = () => {
    const exitMessage = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: `${user.name} saiu do chat`,
    };
    websocket.send(JSON.stringify(exitMessage));
};

const handleLogin = (event) => {
    event.preventDefault();
    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();
    login.style.display = "none";
    chat.style.display = "flex";
    websocket = new WebSocket("ws://localhost:8080");
    websocket.onopen = () => announceNewUser(user.name);
    websocket.onmessage = processMessage;
};

const sendMessage = (event) => {
    event.preventDefault();
    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value,
    };
    websocket.send(JSON.stringify(message));
    chatInput.value = "";
};

const handleLogout = () => {
    announceExitUser();
};

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
window.addEventListener("beforeunload", handleLogout);
