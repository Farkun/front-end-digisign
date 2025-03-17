import "../assets/styles/tandaTangani.css";
import Homepage from "../layouts/homepage";
import React, { useRef, useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { SignatureComponent } from "@syncfusion/ej2-react-inputs";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js`;

function TandaTangani() {
  const signObj = useRef<SignatureComponent | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfImage, setPdfImage] = useState<HTMLImageElement | null>(null);
  const [signatureImage, setSignatureImage] = useState<HTMLImageElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [uploadedImagePos, setUploadedImagePos] = useState<{ [key: number]: { x: number; y: number } }>({});
  const [uploadedImageElement, setUploadedImageElement] = useState<HTMLImageElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [signaturePositions, setSignaturePositions] = useState<{ [key: number]: { x: number; y: number } }>({});



  useEffect(() => {
    if (uploadedImage) {
      const img = new Image();
      img.src = uploadedImage;
      img.onload = () => setUploadedImageElement(img);
    }
  }, [uploadedImage]);

  /** ✅ Fungsi untuk Upload & Render PDF */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setCurrentPage(1);
      renderPdf(file, 1);
    }
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
  const saveSignatureAsImage = async () => {
    if (!signObj.current) return;
    const signatureDataUrl = signObj.current.getSignature();
    if (!signatureDataUrl) return;

    const img = new Image();
    img.src = signatureDataUrl;
    img.onload = () => setSignatureImage(img);
  };

  /** ✅ Fungsi untuk Mengunggah Gambar Tanda Tangan */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setUploadedImage(reader.result as string);
    }
  };

  const handleSignatureDragEnd = (e: any) => {
    setSignaturePositions((prev) => ({
      ...prev,
      [currentPage]: { x: e.target.x(), y: e.target.y() },
    }));
  };

  const handleUploadedImageDragEnd = (e: any) => {
    setUploadedImagePos((prev) => ({
      ...prev,
      [currentPage]: { x: e.target.x(), y: e.target.y() },
    }));
  };

  /** ✅ Fungsi untuk Menyimpan Signature ke dalam PDF */
  const addSignatureToPDF = async () => {
    if (!pdfFile) {
      alert("Pilih file PDF terlebih dahulu!");
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(pdfFile);
    reader.onload = async () => {
      const pdfBytes = new Uint8Array(reader.result as ArrayBuffer);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      for (const [pageNumber, position] of Object.entries(signaturePositions)) {
        const pageIndex = parseInt(pageNumber, 10) - 1; // PDF page index dimulai dari 0
        if (pageIndex < pdfDoc.getPages().length) {
          const page = pdfDoc.getPages()[pageIndex];

          // ✅ Tambahkan tanda tangan digital (jika ada)
          if (signatureImage) {
            const signatureBytes = await fetch(signatureImage.src).then(res => res.arrayBuffer());
            const pdfSignature = await pdfDoc.embedPng(signatureBytes);
            page.drawImage(pdfSignature, {
              x: position.x,
              y: page.getHeight() - position.y - 40,
              width: 120,
              height: 40,
            });

            console.log(`✅ Digital signature ditempatkan di halaman ${pageNumber} pada (${position.x}, ${position.y})`);
          }
        }
      }

      // 🔄 Loop untuk tanda tangan gambar yang diunggah
      for (const [pageNumber, position] of Object.entries(uploadedImagePos)) {
        const pageIndex = parseInt(pageNumber, 10) - 1; // PDF page index dimulai dari 0
        if (pageIndex < pdfDoc.getPages().length) {
          const page = pdfDoc.getPages()[pageIndex];

          // ✅ Tambahkan tanda tangan yang diunggah (jika ada)
          if (uploadedImage) {
            const uploadedBytes = await fetch(uploadedImage).then(res => res.arrayBuffer());
            const pdfUploadedSignature = await pdfDoc.embedPng(uploadedBytes);
            page.drawImage(pdfUploadedSignature, {
              x: position.x,
              y: page.getHeight() - position.y - 40,
              width: 120,
              height: 40,
            });

            console.log(`📸 Uploaded signature ditempatkan di halaman ${pageNumber} pada (${position.x}, ${position.y})`);
          }
        }
      }

      // Simpan & Unduh PDF yang telah dimodifikasi
      console.log("Cek data sebelum ditambahkan ke PDF:");
      console.log("uploadedImagePos:", uploadedImagePos);
      console.log("uploadedImage:", uploadedImage);
      console.log("uploadedImageElement:", uploadedImageElement);
      console.log("signatureImage:", signatureImage);
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      saveAs(blob, "signed-document.pdf");
    };
  };


  return (
    <Homepage>
      <div className="tandaTangani">
        <h1>Unggah dokumen PDF untuk ditandatangani</h1>

        {/* ✅ Input File untuk Tanda Tangan Gambar */}
        <input
          type="file"
          id="uploadSignature"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }} // Sembunyikan input file
        />

        {/* ✅ Signature Pad */}
        <SignatureComponent ref={signObj} velocity={1} />

        <div id="actionBtn">
          <ButtonComponent onClick={saveSignatureAsImage}>Terapkan Tanda Tangan Digital</ButtonComponent>
          <ButtonComponent onClick={() => signObj.current?.clear()}>Bersihkan Tanda Tangan Digital</ButtonComponent>
          <ButtonComponent onClick={() => document.getElementById("uploadSignature")?.click()}>
            Unggah Gambar Tanda Tangan
          </ButtonComponent>
        </div>

        {/* ✅ Canvas Konva untuk PDF + Tanda Tangan */}
        <Stage width={pdfImage?.width || 500} height={pdfImage?.height || 633} className="pdf-stage">
          <Layer>
            {pdfImage && <KonvaImage image={pdfImage} />}
            {signatureImage && (
              <KonvaImage
                image={signatureImage}
                x={signaturePositions[currentPage]?.x || 200}
                y={signaturePositions[currentPage]?.y || 500}
                width={120}
                height={40}
                draggable
                onDragEnd={handleSignatureDragEnd}
              />
            )}
            {uploadedImageElement && (
              <KonvaImage
                image={uploadedImageElement}
                x={uploadedImagePos[currentPage]?.x || 200}
                y={uploadedImagePos[currentPage]?.y || 500}
                width={120}
                height={40}
                draggable
                onDragEnd={handleUploadedImageDragEnd}
              />
            )}
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
          <ButtonComponent onClick={addSignatureToPDF}>Tandatangani & Unduh PDF</ButtonComponent>
        </div>
      </div>
    </Homepage>
  );
}

export default TandaTangani;
