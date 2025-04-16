

export default class DatetimeFormatter {
    public format(datetime: string): string {
        return new Date(datetime).toLocaleDateString('in', {
            day: 'numeric', 
            month: 'short', 
            year: 'numeric', 
            hour:'numeric', 
            minute: 'numeric', 
            second: 'numeric'
        }).split('.').join(':')
    }
}