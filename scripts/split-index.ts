import fs from "fs";
import path from "path";

const indexPath = path.join("src", "types", "index.ts");
const typesDir = path.dirname(indexPath);

// Read the index.ts file
const indexContent = fs.readFileSync(indexPath, "utf8");

const SEPARATOR =
  "//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////";
const sections = indexContent.split(SEPARATOR) as Array<string>;

sections.forEach((s, index, arr) => {
  const trimmed = s.trim();
  const fileName = trimmed.startsWith("// ")
    ? trimmed.replace("// ", "")
    : null;

  if (fileName) {
    const abi = SEPARATOR + s + SEPARATOR + arr[index + 1];

    fs.writeFile(path.join(typesDir, `${fileName}.ts`), abi, err => {
      if (err) {
        console.error("Error writing index.ts:", err);
        return;
      }
    });
  }
});
