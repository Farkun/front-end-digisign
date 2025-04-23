

export default class DatetimeFormatter {
    public format(datetime: string): string {
        // const hari: string[] = [ 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu' ]
        // const bulan: string[] = [ 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember' ]
        // const days: string[] = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ]
        // const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let formattedDate: string = new Date(datetime).toLocaleDateString('id', {
            day: 'numeric', 
            month: 'short', 
            year: 'numeric', 
            hour:'numeric', 
            minute: 'numeric', 
            second: 'numeric',
            timeZone: 'Asia/Jakarta'
        }).split('.').join(':')
        return formattedDate
    }
}