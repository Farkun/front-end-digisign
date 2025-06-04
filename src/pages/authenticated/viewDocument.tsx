import axios from "axios";
import { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";


const ViewDocument = (): ReactElement => {

    const {filename} = useParams<string>()
    const url: string = `${import.meta.env.VITE_API_HOST}/api/storage/document/${filename}`
    const [displaySource, setDisplaySource] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)

    const getDocumentFile = async (): Promise<void> => {
        try {
            let {data} = await axios.get(url, {responseType: 'arraybuffer'})
            if (!data) {
                const response = await axios.get(url, {responseType: 'arraybuffer'})
                data = response?.data
            }
            if (!data || !filename) return
            const newFilename: string = filename.replace('.pdf', '')
            const blob: Blob = new Blob([data], {type: 'application/pdf'})
            const file: File = new File([blob], newFilename, {type: 'application/pdf'})
            setDisplaySource(URL.createObjectURL(file))
            setLoading(false)
        } catch (err: any) {
            console.error(err.message)
        }
    }

    useEffect(() => {getDocumentFile()}, [])

    if (loading) return <div>Loading ...</div>

    return <div style={{
            width: '100vw',
            position: 'absolute',
            top: 0,
            right: 0,
            height: '99.292vh',
            backgroundColor: 'white'
        }}>
        {displaySource ? <iframe src={displaySource} style={{
            width: '100%',
            height: '100%',
            border: 'none'
        }}></iframe> : 'Loading ...'}
    </div>
}

export default ViewDocument