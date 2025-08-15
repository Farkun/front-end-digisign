import axios from "axios";
import { saveAs } from "file-saver";
import { ReactElement } from "react";
import { useParams } from "react-router-dom";


const DownloadDocument = (): ReactElement => {

    const {filename} = useParams<string>()

    const getDocument = async (): Promise<void> => {
        if (filename) try {
            const {data} = await axios.get(import.meta.env.VITE_API_HOST+`/api/document/get-url-by-filename/${filename}`)
            if (!data) return
            getDocumentFile(data)
        } catch (err: any) {
            // console.error(err.message)
        }
    }

    const getDocumentFile = async (url: string): Promise<void> => {
        try {
            const {data} = await axios.get(url, {responseType: 'arraybuffer'});
            if (!data || !filename) return
            const newFilename: string = filename.replace('.pdf', '')
            const blob: Blob = new Blob([data], {type: 'application/pdf'})
            const file: File = new File([blob], newFilename, {type: 'application/pdf'})
            saveAs(file)
        } catch (err: any) {
            // console.error(err.message)
        }
    }

    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0'
    }}>
        <div style={{fontSize: '150px'}}>📄</div>
        <div style={{marginTop: '-20px'}}>{filename}</div>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '10px'
        }}>
            <button onClick={getDocument}>📥 Unduh</button>
        </div>
    </div>
}

export default DownloadDocument