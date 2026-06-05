// Fotograf -> { base64 (API icin), mediaType, thumb (kucuk onizleme data URL) }

export interface PreparedImage {
  base64: string
  mediaType: string
  thumb: string
}

export function prepareImage(file: File): Promise<PreparedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Dosya okunamadi'))
    reader.onload = () => {
      const dataUrl = reader.result as string
      const img = new Image()
      img.onerror = () => reject(new Error('Gorsel acilamadi'))
      img.onload = () => {
        // Kucuk bir onizleme uret (depolama icin)
        const max = 256
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        const thumb = canvas.toDataURL('image/jpeg', 0.7)

        // API icin gonderilecek base64 (orijinali olcekleyip kucult)
        const apiMax = 1024
        const aScale = Math.min(1, apiMax / Math.max(img.width, img.height))
        const aw = Math.round(img.width * aScale)
        const ah = Math.round(img.height * aScale)
        const acanvas = document.createElement('canvas')
        acanvas.width = aw
        acanvas.height = ah
        acanvas.getContext('2d')!.drawImage(img, 0, 0, aw, ah)
        const apiData = acanvas.toDataURL('image/jpeg', 0.85)
        const base64 = apiData.split(',')[1]

        resolve({ base64, mediaType: 'image/jpeg', thumb })
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })
}
