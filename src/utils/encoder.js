import CompressionStream from 'compression-stream'

export default function compress(string, encoding) {
  const byteArray = new TextEncoder().encode(string)
  const cs = new CompressionStream(encoding)
  const writer = cs.writable.getWriter()
  writer.write(byteArray)
  writer.close()
  return new Response(cs.readable).arrayBuffer()
}
