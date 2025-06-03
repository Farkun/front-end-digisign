import axios from "axios";
import { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";


const ViewDocument = (): ReactElement => {

    const {filename} = useParams<string>()
    const url: string = `${import.meta.env.VITE_API_HOST}/api/storage/document/${filename}`
    const [displaySource, setDisplaySource] = useState<string>('')

    const getDocumentFile = async (): Promise<void> => {
        try {
            const {data} = await axios.get(url, {responseType: 'arraybuffer'});
            if (!data || !filename) return
            const newFilename: string = filename.replace('.pdf', '')
            const blob: Blob = new Blob([data], {type: 'application/pdf'})
            const file: File = new File([blob], newFilename, {type: 'application/pdf'})
            setDisplaySource(URL.createObjectURL(file))
        } catch (err: any) {
            console.error(err.message)
        }
    }

    useEffect(() => {getDocumentFile()}, [])

    return <div style={{
            width: '100vw',
            position: 'absolute',
            top: 0,
            right: 0,
            height: '99.292vh',
            backgroundColor: 'white'
        }}>
        {displaySource && <iframe src={displaySource} style={{
            width: '100%',
            height: '100%',
            border: 'none'
        }}></iframe>}
    </div>
}

export default ViewDocument