export function removeFields(obj, fieldsToRemove = []) {
    const result = { ...obj };
    fieldsToRemove.forEach(field => {
        delete result[field];
    });
    return result;
}

export function addFields(obj, fieldsToAdd = {}) {
    return { ...obj, ...fieldsToAdd };
}

export function modifyFields(obj, modifications = {}) {
    const result = { ...obj };
    Object.keys(modifications).forEach(field => {
        if (result[field]) {
            result[field] = { ...result[field], ...modifications[field] };
        }
    });
    return result;
}
