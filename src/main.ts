import * as pack from "../package.json"
import fs from "fs";
import { Command } from "commander";
import { visit_object } from "./object_visitor";
import { cached_translate, load_translations, save_translations, split_long_text_to_chunks } from "./translator";




// translated.text
// translated.from


//cache translations


// (async()=>{
// let openApiContents = JSON.parse(await (await fs.promises.readFile("./test/epn_spec_v2.json")).toString());
// await collect(openApiContents, ['summary', 'description'],"");
// fs.promises.writeFile('./test/processed.json', JSON.stringify(openApiContents));

// console.log("Translated", Object.keys(cache).length, 'calls', translation_calls);
// })();

const text_field_names = ['summary', 'description'];

const program = new Command();
program
    .argument("<input>", "input file name")
    .argument("<output>", "output file name")
    .description("Translates OpenAPI JSON spec file")
    .version(pack.version)
    .option("-l, --language <language code>", "translate to language", "en")
    .action(async (input_filename, output_filename) => {
        console.log("input_filename", input_filename, "output_filename", output_filename);

        let options = program.opts();
        console.log(options);

        await load_translations(options.language);

        let inputFile = await fs.promises.readFile(input_filename);
        let openAPIInput = JSON.parse(inputFile.toString());

        await visit_object(openAPIInput, "", async (obj, key, parent) => {
            if (text_field_names.some(v => key == v)) {
                console.log("visiting", parent);
                try {
                    if (typeof obj[key] == "string" || obj[key] instanceof String) {
                        let splitted = split_long_text_to_chunks(obj[key], 1000);
                        let translated = [];
                        for (let part of splitted) {
                            translated.push(await cached_translate(options.language, part));
                        }
                        // obj[key] = await cached_translate(options.language, obj[key]);
                        obj[key] = translated.join("\n");
                    }
                } catch (e) {
                    console.log("Error translating", obj[key], e);
                    await save_translations(options.language);
                    process.exit(1);
                }
            }
        });

        let openAPIOutput = JSON.stringify(openAPIInput, null, "\t");
        try {
            await fs.promises.writeFile(output_filename, openAPIOutput);
        } catch (e) {
            console.log("unable to save output to", output_filename);
        }

        await save_translations(options.language);
    })
    .parse();


process.on('SIGINT', async () => {
    console.log("Break requested, saving translations");

    await save_translations(program.opts().language);

    process.exit();
});