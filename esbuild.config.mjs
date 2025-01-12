import esbuild from "esbuild";
import process from "process";

const prod = (process.argv[2] === "production");

esbuild.build({
    entryPoints: ["main.ts"],
    bundle: true,
    external: ["obsidian"],
    format: "cjs",
    target: "es2016",
    outfile: "main.js",
}).catch(() => process.exit(1)); 