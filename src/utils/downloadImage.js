const exportAsImage = async (element, imageFileName) => {
  const canvas = element
  const theme = localStorage.getItem('theme') === 'DARK'
  const logo = !theme ? 'colorlogo' : 'whitelogo'
  const dd = canvas.getContext('2d')
  dd.fillStyle = !theme ? '#ffffff' : '#1f222c'
  dd.fillRect(0, canvas.height - 60, 250, 100)
  dd.drawImage(
    document.getElementsByClassName(logo)[0],
    30,
    canvas.height - 60,
    198,
    38
  )

  dd.save()

  const image = dd.canvas.toDataURL('image/png', 1.0)
  downloadImage(image, imageFileName)
}

const downloadImage = (blob, fileName) => {
  const fakeLink = window.document.createElement('a')
  fakeLink.style = 'display:none;'
  fakeLink.download = fileName

  fakeLink.href = blob

  document.body.appendChild(fakeLink)
  fakeLink.click()
  document.body.removeChild(fakeLink)

  fakeLink.remove()
}

export default exportAsImage
