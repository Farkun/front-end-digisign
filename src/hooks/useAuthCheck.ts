import axios from "axios"
import { useEffect, useState } from "react"


interface AuthUser {
    id          : number
    username    : string
    email       : string
    role        : string
    verifiedAt  : Date | null
}

interface UseAuthCheckResult {
    user    : AuthUser | null
    loading : boolean
    error   : string | null
}

const useAuthCheck = (): UseAuthCheckResult => {

    const [user, setUser] = useState<AuthUser |  null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const getMe = async (): Promise<void> => {
        try {
            const {data} = await axios.get(import.meta.env.VITE_API_HOST + `/api/auth/me`, {withCredentials: true})
            if (data) {
                // const {password, verificationTok...userData} = data
                setUser(data)
                setError(null)
            }
        } catch (err: any) {
            setUser(null)
            setError(err.message || "Unauthorized")
        }
        setLoading(false)
    }

    useEffect(() => {getMe()}, [])

    return { user, loading, error }
}

export default useAuthCheck