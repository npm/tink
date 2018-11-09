module.exports = deprCheck

function deprCheck (data) {
  if (data.deprecated) {
    console.warn(`Deprecated ${data._id}: ${data.deprecated}`)
  }
}
