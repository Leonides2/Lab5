// Utilidades generales
function is_valid_phone(phone) {
  let isValid = false;
  const re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i;
  try {
    isValid = re.test(phone);
  } catch (e) {
    console.log(e);
  } finally {
    return isValid;
  }
}

function getRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

module.exports = { is_valid_phone, getRandomColor };
