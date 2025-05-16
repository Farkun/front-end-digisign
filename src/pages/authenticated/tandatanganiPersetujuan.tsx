import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import Cookies from "universal-cookie"
import Homepage from '../../layouts/homepage';
import { Group, Image as KonvaImage, Layer, Line, Stage, Text, Transformer } from "react-konva";
import * as pdfjsLib from 'pdfjs-dist';
import Konva from 'konva';
import Random from "../../utils/Random";
import { jwtDecode } from "jwt-decode";
import CombineImage from "../../utils/CombineImage";
import { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";
import RenderChoice from "../../data_class/RenderChoice";
import { Vector2d } from "konva/lib/types";


const TandaTanganiPersetujuan = () => {
    const stamp: string = 'digitally signed @ sign.bh-foundation.org'

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

    const [renderChoice, setRenderMode] = useState<String>('GRAPHIC')
    const [qrcode, setQrcode] = useState<string | null>(null)
    const [combineSign, setCombineSign] = useState<string | null>(null)
    const [username, setUsername] = useState<string>('')
    const [serial, setSerial] = useState<string>('')

    useEffect(() => {
        if ( isSignatureSelected && signatureTransformerRef.current && signatureImageRef.current ) {
            signatureTransformerRef.current.nodes([signatureImageRef.current]);
            signatureTransformerRef.current.getLayer()?.batchDraw(); // refresh layer supaya Transformer tampil
        }
    }, [isSignatureSelected, signatureImage]);

    const getDocument = async (): Promise<void> => {
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get("bhf-e-sign-access-token")
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
            if (data) {
                const blob: Blob = new Blob([data], {type: 'application/pdf'})
                const file: File = new File([blob], title, {type: 'application/pdf'})
                if (file) {
                    renderPdf(file)
                    setPdfFile(file)
                }
            }
        } catch (err: any) {
            console.error(err.message)
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

    const getCertificate = async (): Promise<void> => {
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get("bhf-e-sign-access-token")
        try {
            const {data} = await axios.get(import.meta.env.VITE_API_HOST+`/api/certificate/get-last`, {
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
            try {
                const {data} = await axios.get(import.meta.env.VITE_API_HOST+`/api/signature/get`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                if (data?.payload) {
                    const userData: any = jwtDecode(cookies.get("bhf-e-sign-access-token")) 
                    userData && setUsername(userData.username)
                    setSerial(`${Random.stringGenerate(8)}-${Random.stringGenerate(8)}-${Random.stringGenerate(8)}`)
                    setSignatureData(data.payload)
                }
                setIsLoadingSignature(false)
                return
            } catch (err:any) {
                console.error(err.message)
                setIsLoadingSignature(false)
                return
            }
        } catch (err: any) {
            alert('Anda belum memiliki sertifikat tanda tangan')
            window.location.href = '/pengaturan/sertifikat'
            return
            // console.error(err.message )
            // setIsLoadingSignature(false)
        }
    }

    const getQr = async (): Promise<void> => {
        setIsLoadingSignature(true)
        const date: string = new Date().toString()
        const randomString: string = date + '5630e8922edec7c41aeee6b3e1ab5f24'
        const size: number = signatureImageSize.height ? signatureImageSize.height : 500
        try {
            const cookies: Cookies = new Cookies
            const token: string = cookies.get('bhf-e-sign-access-token')
            const {data} = await axios.get(import.meta.env.VITE_API_HOST + `/api/qr/generate?content=${randomString}&size=${size}`, {
                responseType: 'json',
                headers: {"Authorization": `Bearer ${token}`}
            })
            if (data) {
                setQrcode(`${data}`)
                setIsLoadingSignature(false)
            }
        } catch (err: any) {
            console.error(err.message)
        }
    }

    useEffect((): void => {
        getCertificate()
        getQr()
        getDocument()
    }, [])
    useEffect(() => {
        const getCombined = async (): Promise<void> => {
            setLoading(true)
            const combine: string | null = await CombineImage.combine(qrcode, signatureData)
            setCombineSign(combine)
            setLoading(false)
        }
        if (qrcode && signatureData) {
            getCombined()
        }
    }, [qrcode, signatureData])

    const attachSign = (data: string | null, choice: string): void => {
        if (data) {
            const img = new Image()
            const renderedImg = new Image()
            img.src = data
            img.onload = () => {
                let width: number = img.width;
                let height: number = img.height;
                if (width > renderedPdfSize.width) {
                    const hRatio = renderedPdfSize.width / width
                    width = renderedPdfSize.width
                    height *= hRatio
                }
                if (height > renderedPdfSize.height) {
                    const wRatio = renderedPdfSize.height / height
                    height = renderedPdfSize.height
                    width *= wRatio
                }
                setSignatureImageSize({width, height})
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                if (!ctx) return
                if (choice == 'IMAGE') ctx.drawImage(img, width/26, height/26, width*12/13, height*12/13);
                else if (choice == 'QR') ctx.drawImage(img, 0, height/3, width/3, height/3);
                else if (choice == 'BOTH') ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/png');
                renderedImg.src = dataUrl
                setSignatureImage(renderedImg)
            }
        }
    }

    const loadSignatureToDocument = async (): Promise<void> => {
        if (loading) return
        setLoading(true)
        if (pdfFile) {
            const passphrase: string | null = prompt('Masukkan passphrase tanda tangan')
            if (!passphrase || passphrase == '') {
                alert('passphrase tidak boleh kosong')
            } else {
                const formData: FormData = new FormData()
                formData.append('document', `${id}`)
                formData.append('file', pdfFile)
                formData.append('passphrase', passphrase)
                formData.append('render_choice', `${renderChoice}`)
                formData.append('rect', `${signaturePositions.x || 0},${signaturePositions.y || 0},${signatureImageSize.width},${signatureImageSize.height}`)
                formData.append('doc_size', `${renderedPdfSize.width},${renderedPdfSize.height}`)
                storeSignedDocument (formData)
            }
        }
        setLoading(false)
    }

    const storeSignedDocument = async (formData: FormData): Promise<void> => {
        const cookies: Cookies = new Cookies
        const token: string = cookies.get("bhf-e-sign-access-token")
        if (token) try {
            const {data} = await axios.put(import.meta.env.VITE_API_HOST+`/api/document/sign`, formData, {
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
    
    const pageLimit = (e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
        let limitTop = 0
        let limitBottom = -e.target.height()
        if (renderChoice == 'QR') {
            limitTop = e.target.height()/3
            limitBottom = -e.target.height()*2/3
        } else if (renderChoice == 'IMAGE') {
            limitTop = e.target.height()/6
            limitBottom = -e.target.height()*5/6
        }
    
        if (e.target.x() < 0) e.target.x(0)
        if (e.target.x() > renderedPdfSize.width - e.target.width()) e.target.x(renderedPdfSize.width - e.target.width())
        if (e.target.y() < -limitTop) e.target.y(-limitTop)
        if (e.target.y() > renderedPdfSize.height + limitBottom) e.target.y(renderedPdfSize.height + limitBottom)
    }
    
    if (isLoadingDocument || isLoadingSignature) return <div>Loading ...</div>

    return <Homepage>
        tandatangani dokumen disetujui

        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{width: '100%'}}>
                <select name="" id="" defaultValue="" style={{margin: '10px', padding: '5px 10px', textAlign: 'center', fontWeight: '600', fontSize: '15px', width: '100%', borderRadius: '7px', backgroundColor: pdfImage ? '#28A745' : '#444'}} disabled={!pdfImage} onChange={(e) => {
                    if (e.target.value == RenderChoice.IMAGE) attachSign(signatureData, e.target.value)
                    else if (e.target.value == RenderChoice.QR) attachSign(qrcode, e.target.value)
                    else if (e.target.value == RenderChoice.BOTH) attachSign(combineSign, e.target.value)
                    setRenderMode(e.target.value)
                }}>
                    <option style={{backgroundColor: '#eee', color: "white"}} value="" disabled>Terapkan Tanda Tangan</option>
                    <option style={{backgroundColor: 'white', color: "black"}} value={RenderChoice.IMAGE}>Tanda Tangan</option>
                    <option style={{backgroundColor: 'white', color: "black"}} value={RenderChoice.QR}>QR Code</option>
                    <option style={{backgroundColor: 'white', color: "black"}} value={RenderChoice.BOTH}>Tanda Tangan dan QR Code</option>
                </select>
                <button type="button" onClick={()=>{
                    setSignatureImage(null)
                    setSignaturePositions({x: 0, y: 0})
                    setIsSignatureSelected(false)
                }}>Hapus Tanda Tangan</button>
            </div>
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
                            pageLimit(e)
                            setSignaturePositions({ x: e.target.x(), y: e.target.y() })
                        }}
                        onDragMove={(e) => {
                            pageLimit(e)
                            setSignaturePositions({ x: e.target.x(), y: e.target.y() })
                        }}
                        onDragStart={() => setIsSignatureSelected(true)}
                        onClick={() => setIsSignatureSelected(true)}
                        onTap={() => setIsSignatureSelected(true)}
                    />}
                {signatureImage && 
                    <Group
                        x={0}
                        y={0}
                        listening={false}
                    >
                        {renderChoice != 'QR' &&
                        <Group
                            x={0}
                            y={0}
                        >
                            <Line 
                            stroke={'black'}
                            strokeWidth={signatureImageSize.height/80}
                            points={[
                                renderChoice == 'IMAGE' ? (signaturePositions?.x || 0) : (signaturePositions?.x || 0) + signatureImageSize.width*69/100,
                                renderChoice == 'IMAGE' ? (signaturePositions?.y || 0) + signatureImageSize.height/6 : (signaturePositions?.y || 0),
                                renderChoice == 'IMAGE' ? (signaturePositions?.x || 0) + signatureImageSize.width/26 : (signaturePositions?.x || 0) + signatureImageSize.width,
                                renderChoice == 'IMAGE' ? (signaturePositions?.y || 0) + signatureImageSize.height/6 : (signaturePositions?.y || 0)
                            ]}
                            />
                            {renderChoice == 'IMAGE' && <Line 
                            stroke={'black'}
                            strokeWidth={signatureImageSize.height/80}
                            points={[
                                (signaturePositions?.x || 0) + signatureImageSize.width*25/26,
                                (signaturePositions?.y || 0) + signatureImageSize.height/6,
                                (signaturePositions?.x || 0) + signatureImageSize.width,
                                (signaturePositions?.y || 0) + signatureImageSize.height/6
                            ]}
                            />}
                            {renderChoice == 'IMAGE' && <Line 
                            stroke={'black'}
                            strokeWidth={signatureImageSize.height/80}
                            points={[
                                (signaturePositions?.x || 0),
                                (signaturePositions?.y || 0) + signatureImageSize.height/6,
                                (signaturePositions?.x || 0),
                                (signaturePositions?.y || 0) + signatureImageSize.height*5/6
                            ]}
                            />}
                            <Line 
                            stroke={'black'}
                            strokeWidth={signatureImageSize.height/80}
                            points={[
                                renderChoice == 'IMAGE' ? ((signaturePositions?.x || 0) + signatureImageSize.width) : ((signaturePositions?.x || 0) + signatureImageSize.width),
                                renderChoice == 'IMAGE' ? (signaturePositions?.y || 0) + signatureImageSize.height/6 : (signaturePositions?.y || 0),
                                renderChoice == 'IMAGE' ? ((signaturePositions?.x || 0) + signatureImageSize.width) : ((signaturePositions?.x || 0) + signatureImageSize.width),
                                renderChoice == 'IMAGE' ? (signaturePositions?.y || 0) + signatureImageSize.height*5/6 : (signaturePositions?.y || 0) + signatureImageSize.height
                            ]}
                            />
                            <Line 
                            stroke={'black'}
                            strokeWidth={signatureImageSize.height/80}
                            points={[
                                renderChoice == 'IMAGE' ? (signaturePositions?.x || 0): (signaturePositions?.x || 0) + signatureImageSize.width*77/100,
                                renderChoice == 'IMAGE' ? (signaturePositions?.y || 0) + signatureImageSize.height*5/6 : (signaturePositions?.y || 0) + signatureImageSize.height,
                                renderChoice == 'IMAGE' ? (signaturePositions?.x || 0) + signatureImageSize.width/14 : (signaturePositions?.x || 0) + signatureImageSize.width,
                                renderChoice == 'IMAGE' ? (signaturePositions?.y || 0) + signatureImageSize.height*5/6 : (signaturePositions?.y || 0) + signatureImageSize.height
                            ]}
                            />
                            {renderChoice == 'IMAGE' && <Line 
                            stroke={'black'}
                            strokeWidth={signatureImageSize.height/80}
                            points={[
                                (signaturePositions?.x || 0) + signatureImageSize.width*13/14,
                                (signaturePositions?.y || 0) + signatureImageSize.height*5/6,
                                (signaturePositions?.x || 0) + signatureImageSize.width,
                                (signaturePositions?.y || 0) + signatureImageSize.height*5/6
                            ]}
                            />}
                            <Text
                            text={renderChoice == 'IMAGE' ? stamp : 'digitally signed'}
                            fontSize={signatureImageSize.height/20}
                            fill="black"
                            x={renderChoice == 'IMAGE' ? (signaturePositions?.x || 0) : (signaturePositions?.x || 0) + signatureImageSize.width*41/80}
                            y={renderChoice == 'IMAGE' ? (signaturePositions?.y || 0) + (signatureImageSize.height/6) - (signatureImageSize.height/40) : (signaturePositions?.y || 0) - (signatureImageSize.height/40)}
                            width={signatureImageSize.width}
                            align={renderChoice == 'IMAGE' ? "center" : 'left'}
                            />
                            <Text
                            text={renderChoice == 'IMAGE' ? serial : 'sign.bh-foundation.org'}
                            fontSize={signatureImageSize.height/20}
                            fill="black"
                            x={renderChoice == 'IMAGE' ? (signaturePositions?.x || 0) : (signaturePositions?.x || 0) + signatureImageSize.width*41/80}
                            y={renderChoice == 'IMAGE' ? (signaturePositions?.y || 0) + signatureImageSize.height*5/6 - (signatureImageSize.height/40) : (signaturePositions?.y || 0) + signatureImageSize.height - (signatureImageSize.height/40)}
                            width={signatureImageSize.width}
                            align={renderChoice == 'IMAGE' ? "center" : 'left'}
                            />
                        </Group>
                        }
                        {renderChoice == 'QR' && <Group
                        x={0}
                        y={0}
                        listening={false}
                        >
                        <Text
                            text={'Digitally signed by:'}
                            fontSize={signatureImageSize.height/30}
                            fill="black"
                            x={(signaturePositions?.x || 0) + signatureImageSize.width*9/25}
                            y={(signaturePositions?.y || 0) + signatureImageSize.height*34/100}
                            width={signatureImageSize.width}
                            align={'left'}
                        />
                        <Text
                            text={renderChoice == 'IMAGE' ? serial : username}
                            fontSize={signatureImageSize.height/20}
                            fill="black"
                            fontStyle="Bold"
                            x={(signaturePositions?.x || 0) + signatureImageSize.width*9/25}
                            y={(signaturePositions?.y || 0) + signatureImageSize.height*19/50}
                            width={signatureImageSize.width}
                            align={renderChoice == 'IMAGE' ? "center" : 'left'}
                        />
                        <Text
                            text={`Date: ${new Date().toUTCString().replace(' GMT', '')}`}
                            fontSize={signatureImageSize.height/30}
                            fill="black"
                            x={(signaturePositions?.x || 0) + signatureImageSize.width*9/25}
                            y={(signaturePositions?.y || 0) + signatureImageSize.height*2/3 - signatureImageSize.height*2/25}
                            width={signatureImageSize.width}
                            align={'left'}
                        />
                        <Text
                            text={`Verify at sign.bh-foundation.org`}
                            fontSize={signatureImageSize.height/30}
                            fill="black"
                            x={(signaturePositions?.x || 0) + signatureImageSize.width*9/25}
                            y={(signaturePositions?.y || 0) + signatureImageSize.height*2/3 - signatureImageSize.height/30}
                            width={signatureImageSize.width}
                            align={'left'}
                        />
                        </Group>}
                    </Group>
                    }
                    {signatureImage && signaturePositions && signatureImageSize && isSignatureSelected &&
                        <Transformer
                        ref={signatureTransformerRef}
                        scaleY={renderChoice == 'IMAGE' ? 2/3 : renderChoice == 'QR' ? 1/3 : 1}
                        offsetY={renderChoice == 'IMAGE' ? -signatureImageSize.height/4 : renderChoice == 'QR' ? -signatureImageSize.height : 0}
                        anchorDragBoundFunc={(oldPos: Vector2d, newPos: Vector2d) => {
                            if (
                            (newPos.x < 0 || newPos.y < 0)
                            || (newPos.x > renderedPdfSize.width || newPos.y > renderedPdfSize.height)
                            ) return oldPos
                            return newPos
                        }}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 50|| newBox.height < 50 || signatureTransformerRef.current?._movingAnchorName == 'top-left') return oldBox
                            newBox.x = oldBox.x
                            newBox.y = oldBox.y
                            if (newBox.width > renderedPdfSize.width) {
                                newBox.width = renderedPdfSize.width
                                newBox.height = renderedPdfSize.width * (oldBox.height/oldBox.width)
                            }
                            if (newBox.height > renderedPdfSize.height) {
                                newBox.height = renderedPdfSize.height
                                newBox.width = renderedPdfSize.height * (oldBox.width/oldBox.height)
                            }
                            if (signatureImageRef.current) {
                                if (newBox.x < 0) newBox.x = 0
                                if (newBox.x > renderedPdfSize.width - newBox.width) newBox.x = renderedPdfSize.width - newBox.width
                                if (newBox.y < 0) newBox.y = 0
                                if (newBox.y > renderedPdfSize.height - newBox.height) newBox.y = renderedPdfSize.height - newBox.height
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