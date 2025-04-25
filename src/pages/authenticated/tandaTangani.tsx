import "../../assets/styles/tandaTangani.css";
import Homepage from "../../layouts/homepage";
import React, { useRef, useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
// import { SignatureComponent } from "@syncfusion/ej2-react-inputs";
// import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import axios from "axios";
import Cookies from "universal-cookie";
import Konva from 'konva';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js`;

function TandaTangani() {
  // const signObj = useRef<SignatureComponent | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true)
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfImage, setPdfImage] = useState<HTMLImageElement | null>(null);
  // const [signatureImage, setSignatureImage] = useState<HTMLImageElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null)
  // const [isSignatureExpired, setIsSignatureExpired] = useState<boolean>(false)

  const [uploadedImagePos, setUploadedImagePos] = useState<{ [key: number]: { x: number; y: number } }>({});
  const [uploadedImageElement, setUploadedImageElement] = useState<HTMLImageElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [signaturePositions, setSignaturePositions] = useState<{ [key: number]: { x: number; y: number } }>({});

  const [signatureImageSize, setSignatureImageSize] = useState<{width: number, height: number}>({width: 0, height: 0})
  const [renderedPdfSize, setRenderedPdfSize] = useState<{width: number, height: number}>({width: 0, height: 0})
  const [isSignatureSelected, setIsSignatureSelected] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(false)

  const signatureRef = useRef<Konva.Image>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  const getSignature = async (): Promise<void> => {
    const cookies: Cookies = new Cookies()
    const token: string = cookies.get("bhf-e-sign-access-token")
    try {
      const {data} = await axios.get(import.meta.env.VITE_API_HOST+`/api/signature/get-certificate`, {headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }})
      if (!data?.payload || !data.payload.expire || !data.payload.passphrase) {
        alert('Anda belum memiliki sertifikat tanda tangan')
        window.location.href = '/pengaturan/sertifikat'
        return
      }
      else {
        const isExpired = new Date().getTime() >= new Date(data.payload.expire).getTime()
        if (isExpired) {
          alert('Sertifikat tanda tangan anda telah kadaluarsa')
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
              setSignature(data.payload.signature)
              setLoadingData(false)
            }
          } catch (err: any) {
            alert('Terjadi kesalahan')
            window.location.href = '/pengaturan/sertifikat'
            return
            // console.error(err.message)
          }
        }
      }
    } catch (err: any) {
      console.error(err.message)
    }
  }

  useEffect(() => {
    getSignature()
  }, [])
  useEffect(() => {
    if (isSignatureSelected && transformerRef.current && signatureRef.current) {
      transformerRef.current.nodes([signatureRef.current]);
      transformerRef.current.getLayer()?.batchDraw(); // refresh layer supaya Transformer tampil
    }
  }, [isSignatureSelected, uploadedImageElement])

  useEffect(() => {
    if (uploadedImage) {
      const img = new Image();
      img.src = uploadedImage;
      img.onload = () => {
        setUploadedImageElement(img)
        setSignatureImageSize({width: img.width, height: img.height})
      }
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

  /** ✅ Fungsi untuk Menyimpan Signature sebagai Gambar */
  // const saveSignatureAsImage = async () => {
  //   if (!signObj.current) return;
  //   const signatureDataUrl = signObj.current.getSignature();
  //   if (!signatureDataUrl) return;
  //   console.log(signatureDataUrl);
    
  //   const img = new Image();
  //   img.src = signatureDataUrl;
  //   img.onload = () => setSignatureImage(img);
  // };

  /** ✅ Fungsi untuk Mengunggah Gambar Tanda Tangan */
  // const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => setUploadedImage(reader.result as string);
  //   }
  // };

  // const handleSignatureDragEnd = (e: any) => {
  //   setSignaturePositions((prev) => ({
  //     ...prev,
  //     [currentPage]: { x: e.target.x(), y: e.target.y() },
  //   }));
  // };

  const handleUploadedImageDragEnd = (e: any) => {
    setUploadedImagePos((prev) => ({
      ...prev,
      [currentPage]: { x: e.target.x(), y: e.target.y() },
    }));
  };

  /** ✅ Fungsi untuk Menyimpan Signature ke dalam PDF */
  const addSignatureToPDF = async () => {
    if (loading) return
    setLoading(true)
    if (!pdfFile) {
      alert("Pilih file PDF terlebih dahulu!");
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(pdfFile);
    reader.onload = async () => {
      const pdfBytes = new Uint8Array(reader.result as ArrayBuffer);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // for (const [pageNumber, position] of Object.entries(signaturePositions)) {
      //   const pageIndex = parseInt(pageNumber, 10) - 1; // PDF page index dimulai dari 0
      //   if (pageIndex < pdfDoc.getPages().length) {
      //     const page = pdfDoc.getPages()[pageIndex];

      //     // ✅ Tambahkan tanda tangan digital (jika ada)
      //     if (signatureImage) {
      //       const signatureBytes = await fetch(signatureImage.src).then(res => res.arrayBuffer());
      //       const pdfSignature = await pdfDoc.embedPng(signatureBytes);

      //       const scaleX = page.getWidth() / renderedPdfSize.width;
      //       const scaleY = page.getHeight() / renderedPdfSize.height;

      //       const drawScale = {
      //           width: signatureImageSize.width * scaleX,
      //           height: signatureImageSize.height * scaleY,
      //       };

      //       console.log(signatureImageSize)
      //       console.log(drawScale)

      //       const drawPosition = {
      //           x: position.x * scaleX,
      //           y: page.getHeight() - drawScale.height - (position.y * scaleY)
      //       }

      //       page.drawImage(pdfSignature, {...drawPosition, ...drawScale})
      //       // page.drawImage(pdfSignature, {
      //       //   x: drawPosition.x,
      //       //   y: drawPosition.y,
      //       //   width: drawScale.width,
      //       //   height: drawScale.height
      //       // })

      //       console.log(`✅ Digital signature ditempatkan di halaman ${pageNumber} pada (${position.x}, ${position.y})`);
      //     }
      //   }
      // }

      // 🔄 Loop untuk tanda tangan gambar yang diunggah
      for (const [pageNumber, position] of Object.entries(uploadedImagePos)) {
        const pageIndex = parseInt(pageNumber, 10) - 1; // PDF page index dimulai dari 0
        if (pageIndex < pdfDoc.getPages().length) {
          const page = pdfDoc.getPages()[pageIndex];

          // ✅ Tambahkan tanda tangan yang diunggah (jika ada)
          if (uploadedImage) {
            const uploadedBytes = await fetch(uploadedImage).then(res => res.arrayBuffer());
            const pdfUploadedSignature = await pdfDoc.embedPng(uploadedBytes);

            const scaleX = page.getWidth() / renderedPdfSize.width;
            const scaleY = page.getHeight() / renderedPdfSize.height;
            const drawScale = {
                width: signatureImageSize.width * scaleX,
                height: signatureImageSize.height * scaleY,
            }
            const drawPosition = {
                x: position.x * scaleX,
                y: page.getHeight() - drawScale.height - (position.y * scaleY)
            }
            page.drawImage(pdfUploadedSignature, {...drawPosition, ...drawScale})

            // page.drawImage(pdfUploadedSignature, {
            //   x: position.x,
            //   y: page.getHeight() - position.y - 40,
            //   width: 120,
            //   height: 40,
            // });

            // console.log(`📸 Uploaded signature ditempatkan di halaman ${pageNumber} pada (${position.x}, ${position.y})`);
          }
        }
      }

      // Simpan & Unduh PDF yang telah dimodifikasi
      // console.log("Cek data sebelum ditambahkan ke PDF:");
      // console.log("uploadedImagePos:", uploadedImagePos);
      // console.log("uploadedImage:", uploadedImage);
      // console.log("uploadedImageElement:", uploadedImageElement);
      // console.log("signatureImage:", signatureImage);
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      saveAs(blob, `[SIGNED] ${pdfFile.name}`);
    };
    setLoading(false)
  };

  if (loadingData) return <div>Loading ...</div>

  return (
    <Homepage>
      <div className="tandaTangani" style={{color: 'black'}}>
        <h1>Unggah dokumen PDF untuk ditandatangani</h1>

        {/* ✅ Input File untuk Tanda Tangan Gambar */}
        {/* <input
          type="file"
          id="uploadSignature"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }} // Sembunyikan input file
        /> */}

        {/* ✅ Signature Pad */}
        {/* <SignatureComponent ref={signObj} velocity={1} />

        <div id="actionBtn">
          <ButtonComponent onClick={saveSignatureAsImage}>Terapkan Tanda Tangan Digital</ButtonComponent>
          <ButtonComponent onClick={() => signObj.current?.clear()}>Bersihkan Tanda Tangan Digital</ButtonComponent>
          <ButtonComponent onClick={() => document.getElementById("uploadSignature")?.click()}>
            Unggah Gambar Tanda Tangan
          </ButtonComponent>
        </div> */}

        {/* ✅ Canvas Konva untuk PDF + Tanda Tangan */}
        <div>
          <button onClick={() => setUploadedImage(signature)} 
          style={pdfImage ? {} : {backgroundColor: 'gray'}} 
          disabled={pdfImage == null}
          >Terapkan Tanda Tangan</button>
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
            {/* {signatureImage && (
              <KonvaImage
                image={signatureImage}
                x={signaturePositions[currentPage]?.x || 200}
                y={signaturePositions[currentPage]?.y || 500}
                width={120}
                height={40}
                draggable
                onDragEnd={handleSignatureDragEnd}
              />
            )} */}
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
                  if (e.target.x() < 0) e.target.x(0)
                  if (e.target.x() > renderedPdfSize.width - e.target.width()) e.target.x(renderedPdfSize.width - e.target.width())
                  if (e.target.y() < 0) e.target.y(0)
                  if (e.target.y() > renderedPdfSize.height - e.target.height()) e.target.y(renderedPdfSize.height - e.target.height())
                  handleUploadedImageDragEnd(e)
                }}
                onDragStart={() => setIsSignatureSelected(true)}
                onClick={() => setIsSignatureSelected(true)}
                onTap={() => setIsSignatureSelected(true)}
              />
            )}
            {uploadedImageElement && signaturePositions && signatureImageSize && isSignatureSelected &&
              <Transformer 
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 50 || newBox.height < 50 || transformerRef.current?._movingAnchorName == 'top-left') return oldBox
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

                      // const calcX: number = renderedPdfSize.width - (newBox.width * 2) - newBox.x
                      // const calcY: number = renderedPdfSize.height - (newBox.height * 2) - newBox.y

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
          <button onClick={addSignatureToPDF} disabled={!pdfFile || !uploadedImage || loading} style={!pdfFile || !uploadedImage || loading ? {backgroundColor: 'gray'} : {}}>Tanda tangani & Unduh PDF</button>
        </div>
      </div>
    </Homepage>
  );
}

export default TandaTangani;
