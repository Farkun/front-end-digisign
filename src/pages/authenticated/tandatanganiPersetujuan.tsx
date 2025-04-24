import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import Cookies from "universal-cookie"
import Homepage from '../../layouts/homepage';
import { Image as KonvaImage, Layer, Stage, Transformer } from "react-konva";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, PDFImage, PDFPage } from "pdf-lib";
import Konva from 'konva';


const TandaTanganiPersetujuan = () => {

    const {id} = useParams<string>()
    const queryParams = new URLSearchParams(window.location.search)
    const pageNumber: number = parseInt(`${queryParams.get('page')}`)

    const [isLoadingSignature, setIsLoadingSignature] = useState<boolean>(true)
    const [isLoadingDocument, setIsLoadingDocument] = useState<boolean>(true)
    const [loading, setLoading] = useState<boolean>(false)
    
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [pdfImage, setPdfImage] = useState<HTMLImageElement | null>(null)
    const [renderedPdfSize, setRenderedPdfSize] = useState<{width: number, height: number}>({width: 0, height: 0})
    const [signatureData, setSignatureData] = useState<string | null>(null)
    const [signatureImageSize, setSignatureImageSize] = useState<{width: number, height: number}>({width: 0, height: 0})
    const [signatureImage, setSignatureImage] = useState<HTMLImageElement | null>(null);
    const [signaturePositions, setSignaturePositions] = useState<{ x: number; y: number }>({x: 0, y: 0});

    const [isSignatureSelected, setIsSignatureSelected] = useState<boolean>(false)
    const signatureImageRef = useRef<Konva.Image>(null)
    const signatureTransformerRef = useRef<Konva.Transformer>(null)

    useEffect(() => {
        if ( isSignatureSelected && signatureTransformerRef.current && signatureImageRef.current ) {
            signatureTransformerRef.current.nodes([signatureImageRef.current]);
            signatureTransformerRef.current.getLayer()?.batchDraw(); // refresh layer supaya Transformer tampil
        }
    }, [isSignatureSelected, signatureImage]);

    const getDocument = async (): Promise<void> => {
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get('accessToken')
        try {
            const {data} = await axios.get(import.meta.env.VITE_API_HOST+`/api/document/requested?document=${id && encodeURIComponent(id)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (!data?.payload) {
                alert('Dokumen tidak ditemukan')
                window.location.href = '/permintaan'
                return
            }
            const signed_url: string | null = data.payload.documentApprovals[0].signedDocument
            if (signed_url) window.location.href = '/permintaan'
            const {url, title} = data.payload
            getDocumentFile(url, title)
        } catch (err: any) {
            alert('Dokumen tidak ditemukan')
            window.location.href = '/permintaan'
            return
        }
        setIsLoadingDocument(false)
    }

    const getDocumentFile = async (url: string, title: string): Promise<void> => {
        try {
            const {data} = await axios.get(url, {responseType: 'arraybuffer'})
            if (!data) {
                alert('Dokumen hilang atau rusak')
                window.location.href = '/permintaan'
                return
            }
            const blob: Blob = new Blob([data], {type: 'application/pdf'})
            const file: File = new File([blob], title, {type: 'application/pdf'})
            if (file) {
                renderPdf(file)
                setPdfFile(file)
            }
        } catch (err: any) {
            alert('Dokumen hilang atau rusak')
            window.location.href = '/permintaan'
            return
            // console.error(err.message)
        }
    }

    const renderPdf = async (file: File) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async () => {
            const pdfData = new Uint8Array(reader.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            if (pageNumber < 1 || pageNumber > pdf.numPages) return; // Cegah halaman tidak valid
            const page = await pdf.getPage(pageNumber);
            const containerWidth = 697; // Sesuaikan dengan lebar <Stage>
            const scale = containerWidth / page.getViewport({ scale: 1 }).width;
            const viewport = page.getViewport({ scale });
            setSignaturePositions({
                x: viewport.width, 
                y: viewport.height
            })
            setRenderedPdfSize({
                width: viewport.width, 
                height: viewport.height
            })
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) return;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;
        
            const img = new Image();
            img.src = canvas.toDataURL();
            setSignaturePositions({x: 0, y: 0.01})
            img.onload = () => setPdfImage(img);
        };
    };

    const getSignature = async (): Promise<void> => {
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get('accessToken')
        try {
            const {data} = await axios.get(import.meta.env.VITE_API_HOST+`/api/signature/get-certificate`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (!data?.payload) {
                alert('Anda belum memiliki sertifikat tanda tangan')
                window.location.href = '/permintaan'
                return
            }
            const isExpired = new Date().getTime() >= new Date(data.payload.expire).getTime()
            if (isExpired) {
                alert('Sertifikat tanda tangan anda telah kadaluarsa')
                window.location.href = '/pengaturan/sertifikat'
                return
            }
            else {
                try {
                    const {data} = await axios.get(import.meta.env.VITE_API_HOST+`/api/signature/get`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                    if (data?.payload) setSignatureData(data.payload.signature)
                    setIsLoadingSignature(false)
                    return
                } catch (err:any) {
                    console.error(err.message)
                    setIsLoadingSignature(false)
                    return
                }
            }
        } catch (err: any) {
            alert('Anda belum memiliki sertifikat tanda tangan')
            window.location.href = '/pengaturan/sertifikat'
            return
            // console.error(err.message )
            // setIsLoadingSignature(false)
        }
    }

    useEffect((): void => {
        getSignature()
        getDocument()
    }, [])

    const attachSign = (): void => {
        if (signatureData) {
            const image = new Image()
            image.src = signatureData
            image.onload = () => {
                setSignatureImageSize({width: image.width, height: image.height})
                setSignatureImage(image)
            }
        }
    }

    const loadSignatureToDocument = async (): Promise<void> => {
        if (loading) return
        setLoading(true)
        if (pdfFile && signatureImage?.src) {
            const passphrase: string | null = prompt('Masukkan passphrase tanda tangan')
            if (!passphrase || passphrase == '') {
                alert('passphrase tidak boleh kosong')
            } else {
                const reader: FileReader = new FileReader()
                reader.readAsArrayBuffer(pdfFile)
                reader.onload = async (): Promise<void> => {
                    const pdfBytes: Uint8Array = new Uint8Array(reader.result as ArrayBuffer)
                    const pdfDoc: PDFDocument = await PDFDocument.load(pdfBytes)
    
                    const index: number = parseInt(`${pageNumber}`, 10) - 1
                    const page: PDFPage = pdfDoc.getPage(index)
                    const {data}: {data: Uint8Array} = await axios.get(signatureImage.src, {'responseType': 'arraybuffer'})
                    const signatureBytes: Uint8Array = data
                    const signPdf: PDFImage = await pdfDoc.embedPng(signatureBytes)
                    
                    const scaleX = page.getWidth() / renderedPdfSize.width;
                    const scaleY = page.getHeight() / renderedPdfSize.height;

                    const drawScale = {
                        width: signatureImageSize.width * scaleX,
                        height: signatureImageSize.height * scaleY,
                    };

                    const drawPosition = {
                        x: signaturePositions.x * scaleX,
                        y: page.getHeight() - drawScale.height - (signaturePositions.y * scaleY)
                    }

                    page.drawImage(signPdf, {
                        x: drawPosition.x,
                        y: drawPosition.y,
                        width: drawScale.width,
                        height: drawScale.height,
                    });
                    

                    const modifiedPdf: Uint8Array = await pdfDoc.save()
                    const blobPdf: Blob = new Blob([modifiedPdf], {type: 'application/pdf'})
                    const outputFilePdf: File = new File([blobPdf], pdfFile.name, {type: 'application/pdf'})
                    storeSignedDocument (id, {
                        file: outputFilePdf,
                        passphrase: passphrase
                    })
                }
            }
        }
        setLoading(false)
    }

    const storeSignedDocument = async (documentId: string | undefined, formData: object): Promise<void> => {
        if (documentId == undefined) throw new Error('document id undefined')
        const cookies: Cookies = new Cookies
        const token: string = cookies.get('accessToken')
        if (token) try {
            const {data} = await axios.put(import.meta.env.VITE_API_HOST+`/api/document/sign?document=${documentId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            if (data) window.location.href = '/permintaan'
        } catch (err: any) {
            console.error(err.message)
        }
    }
    
    if (isLoadingDocument || isLoadingSignature) return <div>Loading ...</div>
    // if (!signatureData) return <Navigate to={'/pengaturan/tanda-tangan'}/>
    // if (!pdfFile) return <Navigate to={'/permintaan'}/>

    return <Homepage>
        tandatangani dokumen disetujui

        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <button type="button" onClick={attachSign} disabled={!signatureData || loading} style={!signatureData || loading ? {backgroundColor: 'gray'} : {}}>Terapkan Tanda Tangan</button>
            <button type="button" onClick={()=>{
                setSignatureImage(null)
                setSignaturePositions({x: 0, y: 0})
                setIsSignatureSelected(false)
            }}>Hapus Tanda Tangan</button>
            <Stage width={pdfImage?.width || 500} height={pdfImage?.height || 633} className="pdf-stage" style={{marginTop: 0}}>
                <Layer onMouseDown={(e) => {
                    if (e.target === e.target.getStage()) {
                        setIsSignatureSelected(false);
                        }
                    }}
                >
                    {pdfImage && <KonvaImage image={pdfImage} />}
                    {signatureImage && signaturePositions && signatureImageSize &&
                    <KonvaImage
                        image={signatureImage}
                        ref={signatureImageRef}
                        x={signaturePositions.x}
                        y={signaturePositions.y}
                        width={signatureImageSize.width}
                        height={signatureImageSize.height}
                        draggable={true}
                        onDragEnd={(e) => {
                            if (e.target.x() < 0) e.target.x(0)
                            if (e.target.x() > renderedPdfSize.width - e.target.width()) e.target.x(renderedPdfSize.width - e.target.width())
                            if (e.target.y() < 0) e.target.y(0)
                            if (e.target.y() > renderedPdfSize.height - e.target.height()) e.target.y(renderedPdfSize.height - e.target.height())
                            setSignaturePositions({ x: e.target.x(), y: e.target.y() });
                        }}
                        onDragStart={() => setIsSignatureSelected(true)}
                        onClick={() => setIsSignatureSelected(true)}
                        onTap={() => setIsSignatureSelected(true)}
                    />}
                    {signatureImage && signaturePositions && signatureImageSize && isSignatureSelected &&
                    <Transformer 
                        ref={signatureTransformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 50 || newBox.height < 50 || signatureTransformerRef.current?._movingAnchorName == 'top-left') return oldBox
                            newBox.x = oldBox.x
                            newBox.y = oldBox.y
                            if (signatureImageRef.current) {
                                signatureImageRef.current.width(newBox.width)
                                signatureImageRef.current.height(newBox.height)
                                setSignatureImageSize({ width: newBox.width, height: newBox.height })
                                setSignaturePositions({ x: newBox.x, y: newBox.y })
                            }
                            return newBox
                        }}
                        rotateEnabled={false}
                        keepRatio={true}
                        enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                        resizeEnabled={true}
                    />
                    }
                </Layer>
            </Stage>
            <button type="button" onClick={loadSignatureToDocument} disabled={!signatureData || !signatureImage || loading} style={!signatureData || !signatureImage || loading ? {backgroundColor: 'gray'} : {}}>Tanda Tangani</button>
        </div>
    </Homepage>
}

export default TandaTanganiPersetujuan