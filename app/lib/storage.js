// storage.js
export function saveAuthState(authState) {
  localStorage.setItem("authState", JSON.stringify(authState));
}

export function loadAuthState() {
  const authState = localStorage.getItem("authState");
  return authState ? JSON.parse(authState) : null;
}
