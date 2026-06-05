// Bagimsiz (dependency yok) PNG ikon ureteci.
// Koyu yuvarlatilmis kare + yesil ilerleme yayi + beyaz tik.
// Cikti: public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../public')
mkdirSync(outDir, { recursive: true })

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const t = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([len, t, data, crc])
}
function pngFromRGBA(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// renk yardimcilari
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const BG = hex('#111111')
const GREEN = hex('#7BD389')
const WHITE = hex('#F6F6F4')

function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy || 1
  let t = ((px - ax) * dx + (py - ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const cx = ax + t * dx
  const cy = ay + t * dy
  return Math.hypot(px - cx, py - cy)
}

function renderIcon(size) {
  const rgba = Buffer.alloc(size * size * 4)
  const radius = size * 0.22 // yuvarlatilmis kose
  const cx = size / 2
  const cy = size / 2
  const ringR = size * 0.3
  const ringW = size * 0.05
  // tik kollari
  const a = [size * 0.40, size * 0.52]
  const b = [size * 0.47, size * 0.60]
  const c = [size * 0.62, size * 0.42]
  const tickW = size * 0.055

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      // yuvarlatilmis kare maskesi
      const rx = Math.max(radius - x, x - (size - radius), 0)
      const ry = Math.max(radius - y, y - (size - radius), 0)
      const inside = Math.hypot(rx, ry) <= radius
      if (!inside) {
        rgba[i + 3] = 0
        continue
      }
      let col = BG
      // ilerleme yayi (~%73 dolu)
      const d = Math.hypot(x - cx, y - cy)
      if (Math.abs(d - ringR) <= ringW / 2) {
        let ang = Math.atan2(y - cy, x - cx) + Math.PI / 2 // tepeden basla
        if (ang < 0) ang += Math.PI * 2
        col = ang <= Math.PI * 2 * 0.73 ? GREEN : [42, 42, 42]
      }
      // beyaz tik
      const dt = Math.min(distToSeg(x, y, a[0], a[1], b[0], b[1]), distToSeg(x, y, b[0], b[1], c[0], c[1]))
      if (dt <= tickW / 2) col = WHITE

      rgba[i] = col[0]
      rgba[i + 1] = col[1]
      rgba[i + 2] = col[2]
      rgba[i + 3] = 255
    }
  }
  return pngFromRGBA(size, size, rgba)
}

for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180]
]) {
  writeFileSync(resolve(outDir, name), renderIcon(size))
  console.log('olusturuldu:', name)
}
