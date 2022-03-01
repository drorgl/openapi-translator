
export async function visit_object(input_object: any, parent: string, callback: (intermediate_object: any, property_name: string, parent_path: string) => Promise<void>) {
    if (input_object == null || input_object == undefined) {
        return;
    }
    if (typeof input_object === 'string' || input_object instanceof String) {
        return;
    }
    if (Array.isArray(input_object)) {
        for (let item of input_object) {
            await visit_object(item, `.${parent}[]`, callback);
        }
    }
    for (let key of Object.keys(input_object)) {
        await callback(input_object, key, `${parent}.${key}`);
        await visit_object(input_object[key],`${parent}.${key}`, callback );
        // console.log("processing", key);
        // if (propertyNames.some(p=>p == key)){
        //     obj[key] = await cached_translate(obj[key], `${parent}.${key}`);
        // }
        // else{
        //     await visit(obj[key], propertyNames, `.${parent}.${key}`);
        // }
    }
}

// export async function visit(obj: any, propertyNames: string[], parent: string) {
//     if (obj == null || obj == undefined) {
//         return;
//     }
//     if (typeof obj === 'string' || obj instanceof String) {
//         return;
//     }
//     if (Array.isArray(obj)) {
//         for (let item of obj) {
//             await visit(item, propertyNames, `.${parent}[]`);
//         }
//     }
//     for (let key of Object.keys(obj)) {
//         // console.log("processing", key);
//         if (propertyNames.some(p => p == key)) {
//             obj[key] = await cached_translate(obj[key], `${parent}.${key}`);
//         }
//         else {
//             await visit(obj[key], propertyNames, `.${parent}.${key}`);
//         }
//     }
// }

