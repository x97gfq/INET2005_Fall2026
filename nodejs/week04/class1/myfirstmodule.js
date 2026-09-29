// A module: anything attached to module.exports can be require()d by another file

function myDateTime() {
  return new Date().toString();
}

module.exports = { myDateTime };
