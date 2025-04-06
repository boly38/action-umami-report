export const formatDate = (isoStr) => {
    const date = new Date(isoStr);
    return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    }) + ' ' + date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
    });
};
export const pad = (num, padLength = 3) => String(num).padStart(padLength, ' ');

export const plural = (count, singular, plural, padLength = 1) => {
    return `${pad(count, padLength)} ${count > 1 ? plural : singular}`;
}
export const secondsToHms = (nbSeconds) => {
    nbSeconds = Number(nbSeconds);
    let h = Math.floor(nbSeconds / 3600);
    let m = Math.floor(nbSeconds % 3600 / 60);
    let s = Math.floor(nbSeconds % 3600 % 60);

    let hDisplay = h !== 0 ? (Math.abs(h) + "h ") : "";
    let mDisplay = m !== 0 ? (Math.abs(m) + "min ") : "";
    let sDisplay = s !== 0 ? (Math.abs(s) + "sec") : "";
    let result = (nbSeconds < 0 ? "-" : "") + hDisplay + mDisplay + sDisplay;
    return result === "" ? "none" : result;
}

export const intValueOf = mixed => {
    if (isNaN(mixed) || mixed === null || mixed === undefined) return 0;
    return mixed;
}

export const formatSession = sess => {
    const {
        browser, os, screen, language,
        country, subdivision1, city,
        firstAt, lastAt, visits, views
    } = sess;

    const loc = `${country}${city ? ` ${subdivision1 || ''} ${city}` : ''}`;
    const period = `${formatDate(firstAt)} - ${formatDate(lastAt)}`;
    const view_s = plural(views, 'view ', 'views', 3);
    const visit_s = plural(visits, 'visit ', 'visits', 3);

    return ` - ${view_s} ${visit_s} | period: ${period} | ${loc.trim()} (${language}) with ${os} ${browser} ${screen}`;
}

