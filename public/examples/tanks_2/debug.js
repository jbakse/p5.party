///////////////////////////////////////////
// DEBUG CODE

/* exported debugShow */
function debugShow(data) {
  const roundIt = (key, value) => {
    if (typeof value === "number") return Math.floor(value * 100) / 100;
    return value;
  };

  document.getElementById("debug").innerText = JSON.stringify(
    data,
    roundIt,
    "  "
  );
}
