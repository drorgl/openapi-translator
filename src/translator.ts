import translate from "@vitalets/google-translate-api";
import os from "os";
import path from "path";
import fs from "fs";

let home_directory = path.join(os.homedir(), ".openapi-translator");

async function fs_exists(pathname: string) {
    try {
        let home_status = await fs.promises.stat(pathname);
        return true;
    } catch (e:any) {
        if (e.code == "ENOENT") {
            return false;
        }
        throw e;
    }
}

async function initialize_home_directory() {
    if (!await fs_exists(home_directory)) {
        await fs.promises.mkdir(home_directory);
    }
}

let translation_caches: {
    [lang: string]: { [key: string]: string }
} = {};

export async function load_translations(lang: string) {
    console.log("Loading translations for", lang);
    await initialize_home_directory();

    let translation_filename = path.join(home_directory, `translations.${lang}.json`);
    if (await fs_exists(translation_filename)) {
        let translation_contents = await fs.promises.readFile(translation_filename);
        let translation_object = JSON.parse(translation_contents.toString());
        translation_caches[lang] = translation_object;
    }
}

export async function save_translations(lang: string) {
    console.log("Saving translations for", lang);
    await initialize_home_directory();
    //, translations: { [key: string]: string }
    let translations = translation_caches[lang] || {};
    let translation_contents = JSON.stringify(translations, null, "\t");
    let translation_filename = path.join(home_directory, `translations.${lang}.json`);
    console.log("writing", translation_filename, translation_contents);
    await fs.promises.writeFile(translation_filename, translation_contents);
}

let translation_calls = 0;

export async function cached_translate(lang: string, str: string) {
    translation_calls++;

    if (str.length == 0){
        return "";
    }

    if (!translation_caches[lang]) {
        translation_caches[lang] = {};
    }

    if (translation_caches[lang][str]) {
        return translation_caches[lang][str];
    }

    console.log("translating",str, "size", str.length);
    let translated = await translate(str, { to: 'en' });
    console.log("Translated", str, "to", translated.text);
    translation_caches[lang][str] = translated.text;
    return translation_caches[lang][str];
}


export function split_long_text_to_chunks(str:string, max_length:number){
    if(str.length < max_length){
        return [str];
    }

    let remains = str.replace(/\r\n/, "\n");

    let splitted_double_crlf = remains.split("\n\n");
    if (!splitted_double_crlf.some(v=>v.length > max_length)){
        return splitted_double_crlf;
    }

    let splitted_more = [];
    for (let section of splitted_double_crlf){
        if (section.length < max_length){
            splitted_more.push(section);
            continue;
        }

        let smaller_chunks = section.split("\n");
        let bulk = "";
        for (let chunk of smaller_chunks){
            if ((bulk.length + chunk.length) > max_length){
                if (bulk == ""){
                    throw new Error("not implemented");
                }else{
                    splitted_more.push(bulk);
                    bulk = "";
                }
            }else{
                bulk += chunk +"\n";
            }
        }
    }

    return splitted_more;
}