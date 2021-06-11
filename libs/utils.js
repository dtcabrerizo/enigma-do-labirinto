
export function sendTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }

}


export function shuffle(array) {
    let m = array.length;
    while (m) {
        const i = Math.floor(Math.random() * m--);
        [array[m], array[i]] = [array[i], array[m]];
    }
    return array;
}


export function getForecolor(backcolor) {
    const d = document.createElement("div");
    d.style.color = backcolor;
    document.body.appendChild(d);
    const color = window.getComputedStyle(d).color;
    document.body.removeChild(d);

    const rgb = color.replace(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/, '$1 $2 $3').split(' ');
    // http://www.w3.org/TR/AERT#color-contrast
    const brightness = Math.round(((parseInt(rgb[0]) * 299) +
        (parseInt(rgb[1]) * 587) +
        (parseInt(rgb[2]) * 114)) / 1000);
    return (brightness > 125) ? 'black' : 'white';

}

