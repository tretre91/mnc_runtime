// import * as stdio from "../lib/stdio.mjs"
import * as stdio from "./lib/stdio.mjs"

var output: HTMLSpanElement;
var cursor = document.createElement("span");
cursor.innerText = "|";
var outputs = document.querySelector("#outputs") as HTMLUListElement;

function add_key_handlers(): void {
    document.addEventListener("keydown", event => { 
        switch (event.key) {
            case "Delete":
            case "Backspace":
                erase_output();
                break;
            default:
                break;
        }
    });
    
    document.addEventListener("keypress", event => { 
        switch (event.key) {
            case "Enter":
                write_output('\n');
                break;
            case "Backspace":
                erase_output();
                break;
            default:
                write_output(event.key);
                break;
        }
    });
}

const importObj: WebAssembly.Imports = {
    std: {
        putchar: stdio.putchar
    }
};

function erase_output(): void {
    output.innerText = output.innerText.substring(0, output.innerText.length - 1);
}

function write_output(s: string): void {
    output.innerText += s;
}

function create_output(): void {
    if (cursor.parentNode != null) {
        cursor.parentNode.removeChild(cursor);
    }
    const li = document.createElement("li");
    output = document.createElement("span");
    li.appendChild(output);
    li.appendChild(cursor);

    outputs.appendChild(li);
    stdio.set_on_output(value => output.innerText += value);
}

create_output();

var file_input = document.querySelector("#source_input") as HTMLInputElement;
file_input.addEventListener('input', load);

function load(): void {
    const files: FileList = file_input.files;
    if (files.length == 0) {
        return;
    }
    
    const file = files[0];
    const reader = new FileReader();

    reader.addEventListener("load", event => {
        const data = reader.result as ArrayBuffer;
        write_output(file.name);
        write_output("\n");
        WebAssembly.instantiate(data, importObj).then(result => {
            const main = result.instance.exports.main as Function;
            main();
            create_output();
        });        
    });

    reader.readAsArrayBuffer(file);
}
