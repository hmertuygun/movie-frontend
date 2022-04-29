import zlib from 'zlib'

export default function lzw_decode(s) {
  // Calling gzip method
  return zlib.gzip(s, (err, buffer) => {
    // Calling unzip method
    return zlib.unzip(buffer, (err, buffer) => {
      return buffer.toString('utf8')
    })
  })
}
