import fs from "fs";
import path from "path";

const typesDir = "./src/types/";
const indexPath = path.join(typesDir, "index.ts");

fs.readdir(typesDir, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  const tsFiles = files.filter(
    file => file.endsWith(".ts") && file !== "index.ts",
  );

  const exportStatements = tsFiles
    .map(file => `export * from "./${path.basename(file, ".ts")}";`)
    .join("\n");

  fs.writeFile(indexPath, exportStatements, err => {
    if (err) {
      console.error("Error writing index.ts:", err);
      return;
    }
    console.log("index.ts has been generated successfully.");
  });
});
