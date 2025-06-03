import axios from "axios";
import { ReactElement, useEffect } from "react";
import { useParams } from "react-router-dom";


const Verifying = (): ReactElement => {

    const {token} = useParams<string>()
    const url: string = `${import.meta.env.VITE_API_HOST}/api/auth/verification/${token}/verify`
    
    const verify = async (): Promise<void> => {
        try {
            const {data} = await axios.get(url)
            if (!data) return
            window.location.href = '/login'
        } catch (err: any) {
            console.error(err.message)
        }
    }

    useEffect(() => {verify()}, [])

    return <div>
        Verifying ...
    </div>
}

export default Verifying