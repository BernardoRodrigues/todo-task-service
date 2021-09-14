const checkIfNullOfUndefined = (...params: any[]): string | null => {
    for(const p of params) {
        if (p == null) {
            return Object.keys(p)[0]
        }
    }
    return null;
}


const encodeString = (str: string): string => {
    return encodeURI(str);

}

const decodeString = (str: string): string => {
    return decodeURI(str);
}

export { checkIfNullOfUndefined, encodeString, decodeString }