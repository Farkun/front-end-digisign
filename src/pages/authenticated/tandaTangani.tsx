import "../../assets/styles/tandaTangani.css";
import Homepage from "../../layouts/homepage";
import React, { useRef, useState, useEffect } from "react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { Stage, Layer, Image as KonvaImage, Transformer, Text, Group, Line } from "react-konva";
import axios from "axios";
import Cookies from "universal-cookie";
import Konva from 'konva';
import RenderChoice from "../../data_class/RenderChoice";
import CombineImage from "../../utils/CombineImage";
import { Vector2d } from "konva/lib/types";
import Random from "../../utils/Random";
import { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";
import { jwtDecode } from "jwt-decode";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js`;

function TandaTangani() {
  const stamp: string = 'digitally signed @ sign.bh-foundation.org'
  
  const [loadingData, setLoadingData] = useState<boolean>(true)
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfImage, setPdfImage] = useState<HTMLImageElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null)

  const [uploadedImagePos, setUploadedImagePos] = useState<{ [key: number]: { x: number; y: number } }>({});
  const [uploadedImageElement, setUploadedImageElement] = useState<HTMLImageElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [signaturePositions, setSignaturePositions] = useState<{ [key: number]: { x: number; y: number } }>({});

  const [signatureImageSize, setSignatureImageSize] = useState<{width: number, height: number}>({width: 0, height: 0})
  const [renderedPdfSize, setRenderedPdfSize] = useState<{width: number, height: number}>({width: 0, height: 0})
  const [isSignatureSelected, setIsSignatureSelected] = useState<boolean>(false)

  const [renderChoice, setRenderMode] = useState<String>('GRAPHIC')
  const [qrcode, setQrcode] = useState<string | null>(null)
  const [combineSign, setCombineSign] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')
  const [serial, setSerial] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)

  const signatureRef = useRef<Konva.Image>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  
  const getCertificate = async (): Promise<void> => {
    setLoadingData(true)
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get("bhf-e-sign-access-token")
    try {
      const {data} = await axios.get(import.meta.env.VITE_API_HOST+`/api/certificate/get-last`, {headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }})
      if (!data?.payload) {
        alert('Anda belum memiliki sertifikat tanda tangan aktif')
        window.location.href = '/pengaturan/sertifikat'
        return
      }
      else {
        try {
          const {data} = await axios.get(import.meta.env.VITE_API_HOST + `/api/signature/get`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          if (data?.payload) {
            const userData: any = jwtDecode(cookies.get("bhf-e-sign-access-token")) 
            userData && setUsername(userData.username)
            setSignature(data.payload)
            setSerial(`${Random.stringGenerate(8)}-${Random.stringGenerate(8)}-${Random.stringGenerate(8)}`)
            setLoadingData(false)
          }
        } catch (err: any) {
          alert('Terjadi kesalahan')
          window.location.href = '/pengaturan/sertifikat'
          return
        }
      }
    } catch (err: any) {
      alert('Anda belum memiliki sertifikat tanda tangan')
      window.location.href = '/pengaturan/sertifikat'
      return
      // console.error(err.message)
    }
  }

  const getQr = async (): Promise<void> => {
    setLoadingData(true)
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
        setLoadingData(false)
      }
    } catch (err: any) {
      console.error(err.message)
    }
  }

  useEffect(() => {
    getCertificate()
    getQr()
  }, [])
  useEffect(() => {
    const getCombined = async (): Promise<void> => {
      setLoading(true)
      const combine: string | null = await CombineImage.combine(qrcode, signature)
      setCombineSign(combine)
      setLoading(false)
    }
    if (qrcode && signature) {
      getCombined()
    }
  }, [qrcode, signature])
  useEffect(() => {
    if (isSignatureSelected && transformerRef.current && signatureRef.current) {
      transformerRef.current.nodes([signatureRef.current]);
      transformerRef.current.getLayer()?.batchDraw(); // refresh layer supaya Transformer tampil
    }
  }, [isSignatureSelected, uploadedImageElement])

  useEffect(() => {
    if (uploadedImage) {
      setLoading(true)
      const img = new Image()
      const renderedImg = new Image()
      img.src = uploadedImage
      img.onload = async () => {
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
        if (renderChoice == 'IMAGE') ctx.drawImage(img, width/26, height/26, width*12/13, height*12/13);
        else if (renderChoice == 'QR') ctx.drawImage(img, 0, height/3, width/3, height/3);
        else if (renderChoice == 'BOTH') ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png');
        renderedImg.src = dataUrl
        setUploadedImageElement(renderedImg)
      }
      setLoading(false)
    }
  }, [uploadedImage]);

  /** ✅ Fungsi untuk Upload & Render PDF */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return
    setLoading(true)
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setCurrentPage(1);
      renderPdf(file, 1);
    }
    setLoading(false)
  };

  /** ✅ Fungsi untuk Merender PDF */
  const renderPdf = async (file: File, pageNumber = 1) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const pdfData = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

      setTotalPages(pdf.numPages); // Simpan total halaman PDF

      if (pageNumber < 1 || pageNumber > pdf.numPages) return; // Cegah halaman tidak valid

      const page = await pdf.getPage(pageNumber);
      const containerWidth = 697; // Sesuaikan dengan lebar <Stage>
      const scale = containerWidth / page.getViewport({ scale: 1 }).width;
      const viewport = page.getViewport({ scale });

      setRenderedPdfSize({width: viewport.width, height: viewport.height})

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      const img = new Image();
      img.src = canvas.toDataURL();
      img.onload = () => setPdfImage(img);
    };
  };

  const handleUploadedImageDragEnd = (e: any) => {
    setUploadedImagePos((prev) => ({
      ...prev,
      [currentPage]: { x: e.target.x(), y: e.target.y() },
    }));
  };

  const addSignatureToPDF = async (): Promise<void> => {
    if (loading) return
    if (!pdfFile) return
    const passphrase: string | null = prompt('Masukkan passphrase')
    if (!passphrase) return
    setLoading(true)
    try {
      const cookies: Cookies = new Cookies()
      const token: string = cookies.get('bhf-e-sign-access-token')
      const position = uploadedImagePos[currentPage]
      const rectangle: string = `${position?.x || 0},${position?.y || 0},${signatureImageSize.width},${signatureImageSize.height}`
      const formData: FormData = new FormData()
      formData.append('file', pdfFile)
      formData.append('page', `${currentPage}`)
      formData.append('render_choice', `${renderChoice}`)
      formData.append('passphrase', passphrase)
      formData.append('rect', rectangle)
      formData.append('doc_size', `${renderedPdfSize.width},${renderedPdfSize.height}`)
      const {data} = await axios.put(import.meta.env.VITE_API_HOST + `/api/document/sign-self`, formData, {
        responseType: 'blob', 
        headers: {
        "Authorization": `Bearer ${token}`
      }})
      // console.log(data)
      if (data) saveAs(data, `[SIGNED] ${pdfFile.name}`)
    } catch (err: any) {
      console.error(err.message)
    }
    setLoading(false)
    
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

  if (loadingData) return <div>Loading ...</div>

  return (
    <Homepage>
      <div className="tandaTangani" style={{color: 'black'}}>
        <h1>Unggah dokumen PDF untuk ditandatangani</h1>
        <div>
          <select name="" id="" defaultValue="" style={{margin: '10px', padding: '5px 10px', textAlign: 'center', fontWeight: '600', fontSize: '15px', width: '100%', borderRadius: '7px', backgroundColor: pdfImage ? '#28A745' : '#444'}} disabled={!pdfImage} onChange={(e) => {
            if (e.target.value == RenderChoice.IMAGE) setUploadedImage(signature)
            else if (e.target.value == RenderChoice.QR) setUploadedImage(qrcode)
            else if (e.target.value == RenderChoice.BOTH) setUploadedImage(combineSign)
            setRenderMode(e.target.value)
          }}>
            <option style={{backgroundColor: '#eee', color: "white"}} value="" disabled>Terapkan Tanda Tangan</option>
            <option style={{backgroundColor: 'white', color: "black"}} value={RenderChoice.IMAGE}>Tanda Tangan</option>
            <option style={{backgroundColor: 'white', color: "black"}} value={RenderChoice.QR}>QR Code</option>
            <option style={{backgroundColor: 'white', color: "black"}} value={RenderChoice.BOTH}>Tanda Tangan dan QR Code</option>
          </select>
          <button onClick={() => {
              setUploadedImage(null)
              setUploadedImageElement(null)
              setUploadedImagePos({...uploadedImagePos, [currentPage]: {x: 0, y: 0}})
            }} 
            style={pdfImage ? {} : {backgroundColor: 'gray'}}
          >Hapus Tanda Tangan</button>
        </div>
        <Stage width={pdfImage?.width || 500} height={pdfImage?.height || 633} className="pdf-stage">
          <Layer>
            {pdfImage && <KonvaImage image={pdfImage} />}
            {uploadedImageElement && (
              <KonvaImage
                ref={signatureRef}
                image={uploadedImageElement}
                x={uploadedImagePos[currentPage]?.x || 0}
                y={uploadedImagePos[currentPage]?.y || 0}
                width={signatureImageSize.width}
                height={signatureImageSize.height}
                draggable
                onDragEnd={(e) => {
                  pageLimit(e)
                  handleUploadedImageDragEnd(e)
                }}
                onDragStart={() => setIsSignatureSelected(true)}
                onDragMove={(e) => {
                  pageLimit(e)
                  handleUploadedImageDragEnd(e)
                }}
                onClick={() => setIsSignatureSelected(true)}
                onTap={() => setIsSignatureSelected(true)}
              />
            )}
            {uploadedImageElement && 
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
                      renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.x || 0) : (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width*69/100,
                      renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height/6 : (uploadedImagePos[currentPage]?.y || 0),
                      renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width/26 : (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width,
                      renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height/6 : (uploadedImagePos[currentPage]?.y || 0)
                    ]}
                  />
                  {renderChoice == 'IMAGE' && <Line 
                    stroke={'black'}
                    strokeWidth={signatureImageSize.height/80}
                    points={[
                      (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width*25/26,
                      (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height/6,
                      (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width,
                      (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height/6
                    ]}
                  />}
                  {renderChoice == 'IMAGE' && <Line 
                    stroke={'black'}
                    strokeWidth={signatureImageSize.height/80}
                    points={[
                      (uploadedImagePos[currentPage]?.x || 0),
                      (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height/6,
                      (uploadedImagePos[currentPage]?.x || 0),
                      (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height*5/6
                    ]}
                  />}
                  <Line 
                    stroke={'black'}
                    strokeWidth={signatureImageSize.height/80}
                    points={[
                      renderChoice == 'IMAGE' ? ((uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width) : ((uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width),
                      renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height/6 : (uploadedImagePos[currentPage]?.y || 0),
                      renderChoice == 'IMAGE' ? ((uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width) : ((uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width),
                      renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height*5/6 : (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height
                    ]}
                  />
                  <Line 
                    stroke={'black'}
                    strokeWidth={signatureImageSize.height/80}
                    points={[
                      renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.x || 0): (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width*77/100,
                      renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height*5/6 : (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height,
                      renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width/14 : (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width,
                      renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height*5/6 : (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height
                    ]}
                  />
                  {renderChoice == 'IMAGE' && <Line 
                    stroke={'black'}
                    strokeWidth={signatureImageSize.height/80}
                    points={[
                      (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width*13/14,
                      (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height*5/6,
                      (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width,
                      (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height*5/6
                    ]}
                  />}
                  <Text
                    text={renderChoice == 'IMAGE' ? stamp : 'digitally signed'}
                    fontSize={signatureImageSize.height/20}
                    fill="black"
                    x={renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.x || 0) : (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width*41/80}
                    y={renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.y || 0) + (signatureImageSize.height/6) - (signatureImageSize.height/40) : (uploadedImagePos[currentPage]?.y || 0) - (signatureImageSize.height/40)}
                    width={signatureImageSize.width}
                    align={renderChoice == 'IMAGE' ? "center" : 'left'}
                  />
                  <Text
                    text={renderChoice == 'IMAGE' ? serial : 'sign.bh-foundation.org'}
                    fontSize={signatureImageSize.height/20}
                    fill="black"
                    x={renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.x || 0) : (uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width*41/80}
                    y={renderChoice == 'IMAGE' ? (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height*5/6 - (signatureImageSize.height/40) : (uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height - (signatureImageSize.height/40)}
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
                  x={(uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width*9/25}
                  y={(uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height*34/100}
                  width={signatureImageSize.width}
                  align={'left'}
                />
                <Text
                  text={renderChoice == 'IMAGE' ? serial : username}
                  fontSize={signatureImageSize.height/20}
                  fill="black"
                  fontStyle="Bold"
                  x={(uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width*9/25}
                  y={(uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height*19/50}
                  width={signatureImageSize.width}
                  align={renderChoice == 'IMAGE' ? "center" : 'left'}
                />
                <Text
                  text={`Date: ${new Date().toUTCString().replace(' GMT', '')}`}
                  fontSize={signatureImageSize.height/30}
                  fill="black"
                  x={(uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width*9/25}
                  y={(uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height*2/3 - signatureImageSize.height*2/25}
                  width={signatureImageSize.width}
                  align={'left'}
                />
                <Text
                  text={`Verify at sign.bh-foundation.org`}
                  fontSize={signatureImageSize.height/30}
                  fill="black"
                  x={(uploadedImagePos[currentPage]?.x || 0) + signatureImageSize.width*9/25}
                  y={(uploadedImagePos[currentPage]?.y || 0) + signatureImageSize.height*2/3 - signatureImageSize.height/30}
                  width={signatureImageSize.width}
                  align={'left'}
                />
              </Group>}
            </Group>
            }
            {uploadedImageElement && signaturePositions && signatureImageSize && isSignatureSelected &&
              <Transformer
                ref={transformerRef}
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
                  if (newBox.width < 50|| newBox.height < 50 || transformerRef.current?._movingAnchorName == 'top-left') return oldBox
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
                    if (signatureRef.current) {
                      if (newBox.x < 0) newBox.x = 0
                      if (newBox.x > renderedPdfSize.width - newBox.width) newBox.x = renderedPdfSize.width - newBox.width
                      if (newBox.y < 0) newBox.y = 0
                      if (newBox.y > renderedPdfSize.height - newBox.height) newBox.y = renderedPdfSize.height - newBox.height
                      signatureRef.current.width(newBox.width)
                      signatureRef.current.height(newBox.height)
                      setSignatureImageSize({ width: newBox.width, height: newBox.height })
                      setSignaturePositions({ ...signaturePositions, [currentPage]: { x: newBox.x, y: newBox.y } })
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
        <div className="pdf-navigation">
          <button
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
                renderPdf(pdfFile as File, currentPage - 1);
              }
            }}
            disabled={currentPage === 1}
          >
            ← Halaman Sebelumnya
          </button>

          {/* 🔄 Input untuk memilih halaman secara langsung */}
          <span>Halaman</span>
          <input
            type="number"
            value={currentPage}
            onChange={(e) => {
              let newPage = parseInt(e.target.value, 10) || 1;
              if (newPage < 1) newPage = 1;
              if (newPage > totalPages) newPage = totalPages;

              setCurrentPage(newPage);
              renderPdf(pdfFile as File, newPage);
            }}
            min="1"
            max={totalPages}
            style={{ width: "50px", textAlign: "center" }}
          />
          <span> dari {totalPages}</span>

          <button
            onClick={() => {
              if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
                renderPdf(pdfFile as File, currentPage + 1);
              }
            }}
            disabled={currentPage === totalPages}
          >
            Halaman Selanjutnya →
          </button>
        </div>
        {/* ✅ Input File untuk PDF */}
        <input type="file" accept="application/pdf" onChange={handleFileChange} />

        <div id="actionBtn">
          <button onClick={addSignatureToPDF} 
          disabled={!pdfFile || !uploadedImage || loading} 
          style={!pdfFile || !uploadedImage || loading ? {backgroundColor: 'gray'} : {}}>Tanda tangani & Unduh PDF</button>
        </div>
      </div>
    </Homepage>
  );
}

export default TandaTangani;
