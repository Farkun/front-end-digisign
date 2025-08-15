

export default class CombineImage {

    public static async combine(image1: string | null, image2: string | null, gap: number = 0): Promise<string | null> {
        if (!image1 || !image2 || image1 == '' || image2 == '') return null
        const img1: HTMLImageElement = new Image()
        const img2: HTMLImageElement = new Image()
        img1.src = image1
        img2.src = image2
        await Promise.all([
            new Promise(res => (img1.onload = res)),
            new Promise(res => (img2.onload = res))
        ])
        
        const width: number = img1.width + (img2.width * (img1.height / img2.height)) + gap
        // if (gap == 0) gap = width*5/100
        // const height: number = Math.max(img1.height, img2.height);
        const height: number = img1.height;
        const canvas: HTMLCanvasElement = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
        if (!ctx) return null
        ctx.drawImage(img1, 0, 0)
        ctx.drawImage(img2, img1.width + gap, 0, img2.width * (img1.height / img2.height), img1.height)
        const combined: string = canvas.toDataURL()
        return combined
    }

}