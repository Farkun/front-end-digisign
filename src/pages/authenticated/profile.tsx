import { ReactElement, useState } from "react";
import Homepage from "../../layouts/homepage";
import axios from "axios";
import Cookies from "universal-cookie";


const Profile = (): ReactElement => {

    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [formDataProfile, setFormDataProfile] = useState<{username: string | null, email: string | null}>({username: null, email: null})
    const [formDataPassword, setFormDataPassword] = useState<{old_password: string | null, new_password: string | null, confirm_new_password: string | null}>({old_password: null, new_password: null, confirm_new_password: null})

    const handleChangeProfileData = (e: any): void => {
        setFormDataProfile({
            ...formDataProfile,
            [e.target.name]: e.target.value
        })
    }

    const handleChangePasswordData = (e: any): void => {
        setFormDataPassword({
            ...formDataPassword,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmitProfile = async (e: any): Promise<void> => {
        e.preventDefault()
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get('accessToken')
        if (confirm("Apakah Anda yakin ingin mengubah data profil Anda?")) try {
            const {data} = await axios.put(import.meta.env.VITE_API_HOST + `/api/users/update-profile`, formDataProfile, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })
            if (data) {
                alert('Profil berhasil diperbarui')
                window.location.reload()
            }
        } catch (err: any) {
            console.error(err.messae)
        }
    }

    const handleSubmitPassword = async (e: any): Promise<void> => {
        e.preventDefault()
        if (formDataPassword.new_password != formDataPassword.confirm_new_password) {
            alert('Konfirmasi kata sandi baru salah')
            return
        }
        const cookies: Cookies = new Cookies()
        const token: string = cookies.get('accessToken')
        if (confirm("Apakah Anda yakin ingin mengubah kata sandi Anda?")) try {
            const {confirm_new_password, ...passData} = formDataPassword
            const {data} = await axios.put(import.meta.env.VITE_API_HOST + `/api/users/change-password`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: passData
            })
            if (data) {
                alert('Kata sandi baru berhasil disimpan')
                window.location.reload()
            }
        } catch (err: any) {
            console.error(err.message)
        }
    }

    return <Homepage>
        <h1 style={window.matchMedia("(prefers-color-scheme: dark)").matches ? {color: 'white', textAlign: 'start'} : {textAlign: 'start'}}>Edit Profile</h1>

        <div style={{backgroundColor: 'white', borderRadius: '10px', padding: '20px', borderLeft: '6px solid #007bff', color: "black", fontWeight: 'normal', margin: '20px', width: '50vw'}}>
            <h3 style={{textAlign: 'start'}}>Username dan Email</h3>
            <form style={{width: '96%'}} onSubmit={handleSubmitProfile}>
                <input type="text" name="username" placeholder="Username" style={{maxWidth: '100%'}} onChange={handleChangeProfileData} required/>
                <input type="email" name="email" placeholder="Email" style={{maxWidth: '100%'}} onChange={handleChangeProfileData} required/>
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button type="submit" style={{width: 'fit-content'}}>Simpan</button>
                </div>
            </form>
        </div>

        <div style={{backgroundColor: 'white', borderRadius: '10px', padding: '20px', borderLeft: '6px solid #007bff', color: "black", fontWeight: 'normal', margin: '20px', width: '50vw'}}>
            <h3 style={{textAlign: 'start'}}>Ubah Kata Sandi</h3>
            <form style={{width: '96%'}} onSubmit={handleSubmitPassword}>
                <input type={showPassword ? "text" : "password"} name="old_password" placeholder="Kata Sandi" style={{maxWidth: '100%'}} onChange={handleChangePasswordData} required/>
                <input type={showPassword ? "text" : "password"} name="new_password" placeholder="Kata Sand iBaru" style={{maxWidth: '100%'}} onChange={handleChangePasswordData} required/>
                <input type={showPassword ? "text" : "password"} name="confirm_new_password" placeholder="Konfirmasi Kata Sand iBaru" style={{maxWidth: '100%'}} onChange={handleChangePasswordData} required/>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                    <button type="button" style={{width: 'fit-content', height: 'fit-content', backgroundColor: 'transparent', color: 'black', fontWeight: '500', fontSize: '14px', padding: 0, margin: 0}} onClick={()=>setShowPassword(!showPassword)}>Lihat Kata Sandi</button>
                    <button type="submit" style={{width: 'fit-content'}}>Simpan</button>
                </div>
            </form>
        </div>

    </Homepage>
}

export default Profile