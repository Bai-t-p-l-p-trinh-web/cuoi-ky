export const formatTimeStamp = (isoString) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getHours().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}/${month}/${year}`;
    
}

export const formatDateDisplay = (isoString) => {
    const date = new Date(isoString);
    const now  = new Date(Date.now());

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getHours().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    const isSameDate = 
        date.getDate() === now.getDate() && 
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if( isSameDate ){
        return `${hours}:${minutes}`;
    } else {
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    }

}

export const getHour = (isoString) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getHours().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}

export const getDate = (isoString) => {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}