import axios from "axios";
import { ReactElement, useEffect } from "react";
import { useParams } from "react-router-dom";
import Cookies from "universal-cookie";


const Verifying = (): ReactElement => {

    const {token} = useParams<string>()
    const url: string = `${import.meta.env.VITE_API_HOST}/api/auth/verification/${token}/verify`
    // const [filed, setFailed] = useState<boolean>(false)

    const verify = async (): Promise<void> => {
        try {
            const cookies: Cookies = new Cookies()
            cookies.remove('bhf-e-sign-access-token')
            const {data} = await axios.get(url)
            console.log(data)
            if (!data) return
            window.location.href = '/'
            return
        } catch (err: any) {
            console.error(err.message)
            // setFailed(true)
        }
    }

    useEffect(() => {verify()}, [])

    // if (filed) return <div style={{fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
    //     <div style={{
    //         color: 'red',
    //         textAlign: 'center',
    //         fontSize: '14px',
    //         fontWeight: 'bold',
    //         border: '2px solid red',
    //         borderRadius: '100%',
    //         width: 'fit-content',
    //         padding: '0 9px'
    //     }}>!</div>
    //     <div style={{textAlign: 'center'}}>
    //         Failed to Verify
    //     </div>
    // </div>

    return <div>
        Verifying ...
    </div>
}

export default Verifying